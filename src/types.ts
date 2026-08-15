export type RiskLevel = 'Low' | 'Medium' | 'High';
export type MetricStatus = 'Active' | 'Unstable' | 'Silent' | 'Overburdened';
export type RiskCategory = 'Slack' | 'Notion' | 'GitHub' | 'KakaoTalk' | 'General';

export interface DimensionAnalytics {
  participation: number; // 0-100
  participationDetails: string;
  imbalance: number; // 0-100
  imbalanceDetails: string;
  conflictRisk: number; // 0-100
  conflictRiskDetails: string;
  toneSentiment: number; // 0-100 (e.g., 100 = very positive, 0 = highly hostile)
  toneSentimentDetails: string;
}

export interface IdentifiedRisk {
  id?: string;
  title: string;
  category: RiskCategory;
  severity: RiskLevel;
  description: string;
  affectedMembers: string[];
}

export interface MemberMetric {
  name: string;
  role: string;
  participationScore: number; // 0-100
  taskCount: number;
  sentimentScore: number; // 0-100
  contributionsCount: number; // commits/PRs
  status: MetricStatus;
}

export interface FeedbackScript {
  scenario: string;
  sender: string;
  recipient: string;
  scriptText: string;
}

export interface ActionPlaybook {
  meetingGuideline: string;
  roleRealignment: string;
  feedbackScripts: FeedbackScript[];
}

export interface AnalysisReport {
  overallRiskScore: number; // 0-100
  riskLevel: RiskLevel;
  summary: string;
  dimensions: DimensionAnalytics;
  identifiedRisks: IdentifiedRisk[];
  memberMetrics: MemberMetric[];
  playbook: ActionPlaybook;
  analyzedAt: string;
}

// Integration Inputs
export interface WorkspaceLogs {
  slackLogs?: string;
  notionNotes?: string;
  githubActivity?: string;
  kakaoLogs?: string;
}

// Scenarios for Sandbox
export interface TeamScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  slackLogs: string;
  notionNotes: string;
  githubActivity: string;
  kakaoLogs?: string;
  members: { name: string; role: string }[];
}
