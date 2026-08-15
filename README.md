# CONVIA

> **AI 없이, 팀의 협업 상태를 데이터로 진단하는 협업 분석 플랫폼**

CONVIA는 Slack, KakaoTalk, Notion, GitHub 등 팀의 업무·커뮤니케이션 데이터를 바탕으로 **참여 균등성, 업무 편중도, 갈등 지수, 소통 온도**를 분석하고 시각화하는 웹 애플리케이션입니다.

특히 이 프로젝트는 **생성형 AI/LLM에 분석을 의존하지 않고**, 직접 정의한 규칙과 통계 기반 분석 엔진을 사용해 동일한 입력에 대해 일관된 결과를 제공하도록 설계했습니다.

---

## ✨ 주요 기능

### 📊 Team Dashboard
팀 전체의 협업 상태를 한눈에 확인할 수 있도록 주요 지표와 분석 결과를 시각화합니다.

### 👥 참여 균등성 분석
구성원별 메시지 및 활동량을 비교해 특정 구성원에게 참여가 편중되어 있는지 확인합니다.

### 📋 업무 편중도 분석
Notion 업무 기록과 GitHub 활동 등을 기반으로 업무가 특정 구성원에게 집중되어 있는지 분석합니다.

### ⚠️ 갈등 지수
마찰, 무응답, 과부하 등 협업 과정에서 나타날 수 있는 위험 신호를 규칙 기반으로 탐지합니다.

### 💬 소통 온도
긍정·부정 표현의 빈도를 기반으로 팀 커뮤니케이션의 분위기를 정량화합니다.

### 🔍 Rule-based Analysis Engine
분석 로직을 별도의 엔진으로 분리해 데이터 처리와 UI를 독립적으로 구성했습니다.

---

## 🧠 분석 방식

```text
Slack / KakaoTalk / Notion / GitHub
                │
                ▼
          데이터 정규화
                │
                ▼
      Rule-based Analysis Engine
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
    참여도    업무편중   갈등/소통
       │        │        │
       └────────┼────────┘
                ▼
          진단 결과 생성
                │
                ▼
        Dashboard Visualization
```

CONVIA의 분석 엔진은 `analysis-engine.ts`에 구현되어 있습니다.

분석 과정에서는 사전에 정의한 키워드와 활동량 등의 데이터를 이용해 지표를 계산하며, **외부 LLM 또는 생성형 AI API를 분석 과정에 사용하지 않습니다.**

---

## 🛠 Tech Stack

| 분야 | 기술 |
|---|---|
| Frontend | React, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Visualization | Recharts |
| UI / Animation | Lucide React, Motion |
| Backend | Node.js, Express |
| Testing | Node.js Test Runner, tsx |
| Package Manager | npm |

---

## 📁 Project Structure

```text
CONVIA/
├── src/
│   ├── components/         # UI components
│   ├── App.tsx             # Main application
│   ├── data.ts             # Application / sample data
│   ├── index.css           # Global styles
│   ├── main.tsx             # React entry point
│   └── types.ts            # Type definitions
│
├── analysis-engine.ts       # Rule-based analysis engine
├── analysis-engine.test.ts  # Analysis engine tests
├── server.ts                # Express server
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Requirements

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/tndus22/CONVIA.git
cd CONVIA
npm install
```

### Run Development Server

```bash
npm run dev
```

실행 후 안내되는 localhost 주소로 접속합니다.

### Test

```bash
npm test
```

### Build

```bash
npm run build
```

---

## 🔐 Environment Variables

Slack 연동 기능을 사용하는 경우 환경변수를 설정할 수 있습니다.

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

> **중요:** 실제 API Key, Token 등의 비밀값은 GitHub에 업로드하지 않습니다. `.env` 파일은 `.gitignore`에서 제외됩니다.

---

## 🎯 Design Principles

### 1. Deterministic Analysis

동일한 입력과 동일한 분석 규칙을 사용했을 때 일관된 결과를 얻을 수 있도록 설계했습니다.

### 2. No Generative AI

분석 결과 생성 과정에 LLM이나 생성형 AI API를 사용하지 않고 코드로 정의된 규칙과 통계에 기반해 결과를 산출합니다.

### 3. Explainable Results

분석 결과가 단순한 예측값으로 끝나지 않도록 어떤 데이터와 규칙을 기반으로 지표가 계산되었는지 설명 가능한 구조를 지향합니다.

### 4. Human-in-the-Loop

분석 결과는 팀 상태를 이해하기 위한 참고 지표이며, 사람의 판단을 완전히 대체하는 것을 목표로 하지 않습니다.

---

## ⚠️ Limitations

- 키워드 기반 분석은 문맥, 반어법, 은어 등의 의미를 완벽하게 이해하지 못할 수 있습니다.
- 메시지 수나 커밋 수가 실제 업무 기여도를 항상 의미하는 것은 아닙니다.
- 분석 점수는 팀 상태를 파악하기 위한 참고 지표이며 인사 평가나 징계 등의 단독 근거로 사용하는 것을 권장하지 않습니다.

---

## 📌 Portfolio

CONVIA는 **React + TypeScript 기반의 웹 애플리케이션 구현**과 함께, 실제 협업 데이터를 활용한 **규칙 기반 데이터 분석 및 시각화**를 하나의 서비스로 구성한 프로젝트입니다.

주요 구현 경험:

- React / TypeScript 기반 UI 구현
- Vite 기반 프론트엔드 개발 환경 구성
- Node.js / Express 서버 구현
- 협업 데이터 분석 로직 설계
- 규칙 기반 진단 엔진 구현
- 데이터 시각화
- 분석 엔진 테스트 코드 작성
- 환경변수 및 API Token 관리

---

## 📄 License

개인 포트폴리오 및 학습 목적으로 작성된 프로젝트입니다.
