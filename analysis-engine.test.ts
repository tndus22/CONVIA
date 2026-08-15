import assert from "node:assert/strict";
import test from "node:test";
import { analyzeLocally } from "./analysis-engine.ts";
import { TEAM_SCENARIOS } from "./src/data.ts";

test("sample scenarios produce complete bounded reports", () => {
  for (const scenario of TEAM_SCENARIOS) {
    const report = analyzeLocally(scenario);
    assert.ok(report.overallRiskScore >= 0 && report.overallRiskScore <= 100);
    assert.ok(report.dimensions.participation >= 0 && report.dimensions.participation <= 100);
    assert.ok(report.dimensions.imbalance >= 0 && report.dimensions.imbalance <= 100);
    assert.ok(report.dimensions.conflictRisk >= 0 && report.dimensions.conflictRisk <= 100);
    assert.ok(report.dimensions.toneSentiment >= 0 && report.dimensions.toneSentiment <= 100);
    assert.deepEqual(report.memberMetrics.map((member) => member.name), scenario.members.map((member) => member.name));
    assert.ok(report.identifiedRisks.length > 0);
    assert.ok(report.playbook.feedbackScripts.length > 0);
  }
});

test("same input produces the same diagnostic values", () => {
  const scenario = TEAM_SCENARIOS[0];
  const first = analyzeLocally(scenario);
  const second = analyzeLocally(scenario);

  assert.deepEqual(
    { ...first, analyzedAt: undefined },
    { ...second, analyzedAt: undefined },
  );
});

test("high-friction sample is not classified as low risk", () => {
  const report = analyzeLocally(TEAM_SCENARIOS[1]);
  assert.notEqual(report.riskLevel, "Low");
  assert.ok(report.dimensions.conflictRisk >= 50);
});

test("empty input is rejected", () => {
  assert.throws(() => analyzeLocally({}), /비어 있습니다/);
});
