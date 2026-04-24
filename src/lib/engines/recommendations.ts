import { type Insight } from "@/lib/engines/insights";

export interface Recommendation {
  id: string;
  title: string;
  rationale: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  linkedInsightId: string;
  actions: string[];
  metric: string;
}

// ─── Recommendation mappings per insight ─────────────────────────────────────
const RECOMMENDATION_MAP: Record<string, Recommendation[]> = {
  "ins-dev-bottleneck": [
    {
      id:              "rec-001",
      title:           "Decompose Work Into Smaller Tasks",
      rationale:       "Large tasks inflate cycle time. Breaking them into sub-issues of 1–2 day scope reduces context switching and accelerates feedback loops.",
      impact:          "high",
      effort:          "low",
      linkedInsightId: "ins-dev-bottleneck",
      metric:          "Cycle Time",
      actions: [
        "Ensure each task is completable within 1–2 days before starting",
        "Use story-point estimates of ≤ 5 to enforce decomposition",
        "Create one GitHub issue per logical unit of work",
        "Track sub-task completion daily in standups",
      ],
    },
    {
      id:              "rec-002",
      title:           "Reduce PR Size to Improve Throughput",
      rationale:       "Smaller PRs are reviewed faster, merged sooner, and introduce fewer conflicts — directly increasing PR throughput.",
      impact:          "high",
      effort:          "low",
      linkedInsightId: "ins-dev-bottleneck",
      metric:          "PR Throughput",
      actions: [
        "Target ≤ 400 lines changed per PR",
        "Use feature flags to merge unfinished features safely",
        "Split large refactors into separate PRs from features",
        "Set up a PR size lint check in CI",
      ],
    },
  ],
  "ins-review-delay": [
    {
      id:              "rec-003",
      title:           "Increase Review Frequency",
      rationale:       "Scheduling dedicated review slots prevents code from sitting idle for 24+ hours after submission.",
      impact:          "high",
      effort:          "low",
      linkedInsightId: "ins-review-delay",
      metric:          "Lead Time",
      actions: [
        "Establish a team norm: review PRs within 4 business hours",
        "Add PR review to the team's daily standup checklist",
        "Use GitHub notifications or Slack integration for instant alerts",
        "Rotate a designated reviewer each day",
      ],
    },
    {
      id:              "rec-004",
      title:           "Streamline Deployment Pipeline",
      rationale:       "Automated deployment after merge approval removes human bottlenecks in the release stage.",
      impact:          "medium",
      effort:          "medium",
      linkedInsightId: "ins-review-delay",
      metric:          "Lead Time",
      actions: [
        "Enable auto-merge on passing CI checks",
        "Deploy to staging automatically on merge to main",
        "Use deployment queues to batch small changes",
        "Add deployment frequency metrics to the CI dashboard",
      ],
    },
  ],
  "ins-quality-debt": [
    {
      id:              "rec-005",
      title:           "Introduce Pre-Merge Quality Gates",
      rationale:       "Mandatory test coverage thresholds and linting checks prevent defects from reaching production at high deployment velocity.",
      impact:          "high",
      effort:          "medium",
      linkedInsightId: "ins-quality-debt",
      metric:          "Bug Rate",
      actions: [
        "Set minimum 80% unit test coverage in CI pipeline",
        "Add integration tests for all user-facing flows",
        "Block merges if coverage drops below threshold",
        "Schedule weekly test debt review sessions",
      ],
    },
    {
      id:              "rec-006",
      title:           "Deploy Smaller Batches",
      rationale:       "Smaller, more focused deployments are easier to test, easier to roll back, and reduce blast radius of defects.",
      impact:          "high",
      effort:          "low",
      linkedInsightId: "ins-quality-debt",
      metric:          "Deployment Frequency",
      actions: [
        "Limit each deployment to ≤ 3 feature changes",
        "Use feature flags for large feature rollouts",
        "Implement canary deployments for high-risk changes",
        "Add automated smoke tests post-deploy",
      ],
    },
  ],
  "ins-deploy-failures": [
    {
      id:              "rec-007",
      title:           "Strengthen Pre-Deployment Validation",
      rationale:       "Rollbacks are expensive. A robust staging environment that mirrors production prevents failures from reaching users.",
      impact:          "high",
      effort:          "medium",
      linkedInsightId: "ins-deploy-failures",
      metric:          "Deployment Frequency",
      actions: [
        "Require all PRs to pass staging deployment before production",
        "Add health checks and readiness probes to all services",
        "Implement automated rollback on failed health checks",
        "Track MTTR (mean time to recovery) per deployment",
      ],
    },
  ],
  "ins-healthy": [
    {
      id:              "rec-008",
      title:           "Maintain & Mentor",
      rationale:       "Healthy metrics are worth preserving. Share your workflow patterns with teammates to lift the team baseline.",
      impact:          "medium",
      effort:          "low",
      linkedInsightId: "ins-healthy",
      metric:          "Team Velocity",
      actions: [
        "Document your task decomposition strategy in the team wiki",
        "Offer to pair-program with colleagues showing higher cycle times",
        "Contribute to team review SLA improvements",
        "Propose automated alerts when metrics regress",
      ],
    },
  ],
};

// ─── Engine entry point ───────────────────────────────────────────────────────
export function runRecommendationEngine(insights: Insight[]): Recommendation[] {
  const recs: Recommendation[] = [];
  for (const insight of insights) {
    const mapped = RECOMMENDATION_MAP[insight.id];
    if (mapped) recs.push(...mapped);
  }
  // Deduplicate
  const seen = new Set<string>();
  return recs.filter((r) => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
}
