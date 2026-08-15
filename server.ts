import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { analyzeLocally } from "./analysis-engine";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "5mb" }));

// 모든 진단은 서버 프로세스 안에서 규칙과 통계만으로 수행됩니다.
// 입력 원문은 저장하지 않으며 외부 생성형 AI 서비스로 보내지 않습니다.
app.post("/api/analyze", (req, res) => {
  const { slackLogs, kakaoLogs, notionNotes, githubActivity, members } = req.body || {};

  if (![slackLogs, kakaoLogs, notionNotes, githubActivity].some((value) => typeof value === "string" && value.trim())) {
    res.status(400).json({
      error: "분석할 데이터가 비어 있습니다. 슬랙, 카카오톡, 노션, 깃허브 중 최소 하나 이상의 데이터를 입력해 주세요.",
    });
    return;
  }

  try {
    res.json(analyzeLocally({ slackLogs, kakaoLogs, notionNotes, githubActivity, members }));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "로컬 분석 중 오류가 발생했습니다.";
    console.error("Convia local analysis error:", message);
    res.status(422).json({ error: message });
  }
});

// Slack 연동은 사용자가 명시적으로 요청할 때만 Slack API에 접근합니다.
const SLACK_API = "https://slack.com/api";

async function slackCall(
  method: string,
  token: string,
  params: Record<string, string | number | undefined> = {},
): Promise<any> {
  const url = new URL(`${SLACK_API}/${method}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.append(key, String(value));
  }

  const response = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json();
  if (!data.ok) throw new Error(`Slack API '${method}' 오류: ${data.error || "unknown_error"}`);
  return data;
}

function looksLikeChannelId(value: string): boolean {
  return /^[CGD][A-Z0-9]{6,}$/.test(value.trim());
}

async function resolveChannelId(token: string, channelInput: string): Promise<string> {
  const trimmed = channelInput.trim();
  if (looksLikeChannelId(trimmed)) return trimmed;

  const name = trimmed.replace(/^#/, "");
  let cursor: string | undefined;
  do {
    const data = await slackCall("conversations.list", token, {
      types: "public_channel,private_channel",
      limit: 1000,
      cursor,
    });
    const found = (data.channels || []).find((channel: any) => channel.name === name);
    if (found) return found.id;
    cursor = data.response_metadata?.next_cursor || "";
  } while (cursor);

  throw new Error(`'${name}' 채널을 찾을 수 없습니다. 봇이 채널에 초대되어 있고 채널명이 정확한지 확인해 주세요.`);
}

function buildUserNameResolver(token: string) {
  const cache = new Map<string, string>();
  return async (userId: string): Promise<string> => {
    if (!userId) return "알 수 없음";
    if (cache.has(userId)) return cache.get(userId)!;
    try {
      const data = await slackCall("users.info", token, { user: userId });
      const user = data.user;
      const name = user?.profile?.display_name?.trim()
        || user?.profile?.real_name?.trim()
        || user?.real_name?.trim()
        || user?.name
        || userId;
      cache.set(userId, name);
      return name;
    } catch {
      cache.set(userId, userId);
      return userId;
    }
  };
}

function formatSlackTs(timestamp: string): string {
  const milliseconds = Math.floor(Number.parseFloat(timestamp) * 1000);
  return new Date(milliseconds).toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

app.post("/api/slack/fetch", async (req, res) => {
  const { token, channel } = req.body || {};
  const botToken = (typeof token === "string" && token.trim()) || process.env.SLACK_BOT_TOKEN;

  if (!botToken) {
    res.status(400).json({ error: "Slack Bot Token이 필요합니다. (xoxb-로 시작)" });
    return;
  }
  if (typeof channel !== "string" || !channel.trim()) {
    res.status(400).json({ error: "채널 이름 또는 채널 ID를 입력해 주세요." });
    return;
  }

  try {
    const channelId = await resolveChannelId(botToken, channel);
    const resolveName = buildUserNameResolver(botToken);
    const history = await slackCall("conversations.history", botToken, { channel: channelId, limit: 100 });
    const messages = (history.messages || [])
      .filter((message: any) => message.type === "message" && !message.subtype && message.user && message.text)
      .reverse();

    const lines: string[] = [];
    for (const message of messages) {
      const name = await resolveName(message.user);
      const time = formatSlackTs(message.ts);
      let text: string = message.text;
      const mentionIds = [...text.matchAll(/<@([A-Z0-9]+)>/g)].map((match) => match[1]);
      for (const id of mentionIds) {
        const mentionName = await resolveName(id);
        text = text.replace(new RegExp(`<@${id}>`, "g"), `@${mentionName}`);
      }
      text = text
        .replace(/<#[A-Z0-9]+\|([^>]+)>/g, "#$1")
        .replace(/<(https?:[^|>]+)\|([^>]+)>/g, "$2")
        .replace(/<(https?:[^>]+)>/g, "$1")
        .replace(/\n+/g, " ")
        .trim();
      lines.push(`[${name}] (${time}): ${text}`);
    }

    if (lines.length === 0) {
      res.json({
        formatted: "",
        channelId,
        messageCount: 0,
        warning: "채널에서 분석 가능한 메시지를 찾지 못했습니다. 봇이 채널에 참여해 있는지 확인해 주세요.",
      });
      return;
    }
    res.json({ formatted: lines.join("\n"), channelId, messageCount: lines.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Slack 데이터를 가져오는 중 오류가 발생했습니다.";
    res.status(500).json({ error: message });
  }
});

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Convia local rule-based analyzer running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
