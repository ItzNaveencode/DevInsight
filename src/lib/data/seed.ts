// ─── Mock Database (simulating PostgreSQL seeded data) ───────────────────────

export interface Developer {
  developer_id: string;
  name: string;
  team_name: string;
  avatar: string;
  role: string;
}

export interface Issue {
  issue_id: string;
  developer_id: string;
  title: string;
  in_progress_at: string;
  done_at: string;
}

export interface PullRequest {
  pr_id: string;
  developer_id: string;
  title: string;
  opened_at: string;
  merged_at: string | null;
  first_review_at: string | null;
  size: "small" | "medium" | "large";
}

export interface Deployment {
  deployment_id: string;
  pr_id: string;
  completed_at: string;
  status: "success" | "failed" | "rollback";
}

export interface Bug {
  bug_id: string;
  linked_issue_id: string;
  escaped_to_prod: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

// ─── Developers ───────────────────────────────────────────────────────────────

export const developers: Developer[] = [
  { developer_id: "dev-001", name: "Alex Rivera",   team_name: "Platform",  avatar: "AR", role: "Senior Engineer" },
  { developer_id: "dev-002", name: "Priya Kapoor",  team_name: "Platform",  avatar: "PK", role: "Staff Engineer" },
  { developer_id: "dev-003", name: "Marcus Chen",   team_name: "Growth",    avatar: "MC", role: "Mid Engineer" },
  { developer_id: "dev-004", name: "Sofia Andrade", team_name: "Growth",    avatar: "SA", role: "Senior Engineer" },
  { developer_id: "dev-005", name: "James Okafor",  team_name: "Infra",     avatar: "JO", role: "DevOps Engineer" },
];

// ─── Helper: offset date string ───────────────────────────────────────────────
function daysAgo(n: number, hoursOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(d.getHours() - hoursOffset);
  return d.toISOString();
}

// ─── Issues (last 30 days) ────────────────────────────────────────────────────

export const issues: Issue[] = [
  // Alex Rivera — dev-001 (healthy developer)
  { issue_id: "iss-001", developer_id: "dev-001", title: "Implement auth middleware",       in_progress_at: daysAgo(28), done_at: daysAgo(24) },
  { issue_id: "iss-002", developer_id: "dev-001", title: "Refactor token validation",       in_progress_at: daysAgo(22), done_at: daysAgo(19) },
  { issue_id: "iss-003", developer_id: "dev-001", title: "Add rate limiting to API",        in_progress_at: daysAgo(16), done_at: daysAgo(13) },
  { issue_id: "iss-004", developer_id: "dev-001", title: "Fix session expiry bug",          in_progress_at: daysAgo(10), done_at: daysAgo(8)  },
  { issue_id: "iss-005", developer_id: "dev-001", title: "Improve error logging format",    in_progress_at: daysAgo(5),  done_at: daysAgo(3)  },

  // Priya Kapoor — dev-002 (high cycle time, low throughput → dev bottleneck)
  { issue_id: "iss-006", developer_id: "dev-002", title: "Database query optimisation",     in_progress_at: daysAgo(30), done_at: daysAgo(18) },
  { issue_id: "iss-007", developer_id: "dev-002", title: "Schema migration strategy",       in_progress_at: daysAgo(17), done_at: daysAgo(6)  },

  // Marcus Chen — dev-003 (high lead time, normal cycle time → review delay)
  { issue_id: "iss-008", developer_id: "dev-003", title: "Build analytics pipeline",        in_progress_at: daysAgo(28), done_at: daysAgo(23) },
  { issue_id: "iss-009", developer_id: "dev-003", title: "A/B test framework",              in_progress_at: daysAgo(20), done_at: daysAgo(16) },
  { issue_id: "iss-010", developer_id: "dev-003", title: "Funnel tracking events",          in_progress_at: daysAgo(14), done_at: daysAgo(10) },
  { issue_id: "iss-011", developer_id: "dev-003", title: "Segment integration",             in_progress_at: daysAgo(9),  done_at: daysAgo(5)  },

  // Sofia Andrade — dev-004 (high bug rate + high deployment frequency → quality issues)
  { issue_id: "iss-012", developer_id: "dev-004", title: "User onboarding revamp",          in_progress_at: daysAgo(29), done_at: daysAgo(26) },
  { issue_id: "iss-013", developer_id: "dev-004", title: "Referral system logic",           in_progress_at: daysAgo(24), done_at: daysAgo(21) },
  { issue_id: "iss-014", developer_id: "dev-004", title: "Subscription flow fixes",         in_progress_at: daysAgo(18), done_at: daysAgo(15) },
  { issue_id: "iss-015", developer_id: "dev-004", title: "Payment provider switch",         in_progress_at: daysAgo(12), done_at: daysAgo(9)  },
  { issue_id: "iss-016", developer_id: "dev-004", title: "Discount code engine",            in_progress_at: daysAgo(7),  done_at: daysAgo(4)  },

  // James Okafor — dev-005 (stable infra, good metrics)
  { issue_id: "iss-017", developer_id: "dev-005", title: "K8s autoscaling config",          in_progress_at: daysAgo(27), done_at: daysAgo(24) },
  { issue_id: "iss-018", developer_id: "dev-005", title: "Prometheus alerting rules",       in_progress_at: daysAgo(21), done_at: daysAgo(18) },
  { issue_id: "iss-019", developer_id: "dev-005", title: "Grafana dashboard templates",     in_progress_at: daysAgo(15), done_at: daysAgo(13) },
  { issue_id: "iss-020", developer_id: "dev-005", title: "Terraform state management",      in_progress_at: daysAgo(10), done_at: daysAgo(8)  },
  { issue_id: "iss-021", developer_id: "dev-005", title: "Helm chart upgrades",             in_progress_at: daysAgo(5),  done_at: daysAgo(3)  },
];

// ─── Pull Requests ────────────────────────────────────────────────────────────

export const pullRequests: PullRequest[] = [
  // dev-001 — healthy
  { pr_id: "pr-001", developer_id: "dev-001", title: "feat: auth middleware",        opened_at: daysAgo(27), merged_at: daysAgo(24), first_review_at: daysAgo(26), size: "small" },
  { pr_id: "pr-002", developer_id: "dev-001", title: "refactor: token validation",   opened_at: daysAgo(21), merged_at: daysAgo(19), first_review_at: daysAgo(20), size: "small" },
  { pr_id: "pr-003", developer_id: "dev-001", title: "feat: rate limiting",          opened_at: daysAgo(15), merged_at: daysAgo(13), first_review_at: daysAgo(14), size: "medium" },
  { pr_id: "pr-004", developer_id: "dev-001", title: "fix: session expiry",          opened_at: daysAgo(9),  merged_at: daysAgo(8),  first_review_at: daysAgo(8),  size: "small" },
  { pr_id: "pr-005", developer_id: "dev-001", title: "chore: logging format",        opened_at: daysAgo(4),  merged_at: daysAgo(3),  first_review_at: daysAgo(3),  size: "small" },

  // dev-002 — high cycle time, low throughput
  { pr_id: "pr-006", developer_id: "dev-002", title: "feat: query optimisation",     opened_at: daysAgo(28), merged_at: daysAgo(18), first_review_at: daysAgo(25), size: "large" },
  { pr_id: "pr-007", developer_id: "dev-002", title: "feat: schema migration",       opened_at: daysAgo(15), merged_at: daysAgo(6),  first_review_at: daysAgo(13), size: "large" },

  // dev-003 — high lead time, normal cycle time → review delay
  { pr_id: "pr-008", developer_id: "dev-003", title: "feat: analytics pipeline",     opened_at: daysAgo(26), merged_at: daysAgo(22), first_review_at: daysAgo(22), size: "medium" },
  { pr_id: "pr-009", developer_id: "dev-003", title: "feat: a/b test framework",     opened_at: daysAgo(19), merged_at: daysAgo(15), first_review_at: daysAgo(15), size: "medium" },
  { pr_id: "pr-010", developer_id: "dev-003", title: "feat: funnel events",          opened_at: daysAgo(13), merged_at: daysAgo(9),  first_review_at: daysAgo(9),  size: "small" },
  { pr_id: "pr-011", developer_id: "dev-003", title: "feat: segment integration",    opened_at: daysAgo(8),  merged_at: daysAgo(4),  first_review_at: daysAgo(4),  size: "medium" },

  // dev-004 — high freq + high bug rate
  { pr_id: "pr-012", developer_id: "dev-004", title: "feat: onboarding revamp",      opened_at: daysAgo(28), merged_at: daysAgo(26), first_review_at: daysAgo(27), size: "medium" },
  { pr_id: "pr-013", developer_id: "dev-004", title: "feat: referral logic",          opened_at: daysAgo(23), merged_at: daysAgo(21), first_review_at: daysAgo(22), size: "small" },
  { pr_id: "pr-014", developer_id: "dev-004", title: "fix: subscription flow",        opened_at: daysAgo(17), merged_at: daysAgo(15), first_review_at: daysAgo(16), size: "medium" },
  { pr_id: "pr-015", developer_id: "dev-004", title: "feat: payment switch",          opened_at: daysAgo(11), merged_at: daysAgo(9),  first_review_at: daysAgo(10), size: "large" },
  { pr_id: "pr-016", developer_id: "dev-004", title: "feat: discount engine",         opened_at: daysAgo(6),  merged_at: daysAgo(4),  first_review_at: daysAgo(5),  size: "medium" },
  { pr_id: "pr-017", developer_id: "dev-004", title: "hotfix: coupon validation",     opened_at: daysAgo(3),  merged_at: daysAgo(2),  first_review_at: daysAgo(2),  size: "small" },

  // dev-005 — stable
  { pr_id: "pr-018", developer_id: "dev-005", title: "feat: k8s autoscaling",         opened_at: daysAgo(26), merged_at: daysAgo(24), first_review_at: daysAgo(25), size: "medium" },
  { pr_id: "pr-019", developer_id: "dev-005", title: "feat: alerting rules",           opened_at: daysAgo(20), merged_at: daysAgo(18), first_review_at: daysAgo(19), size: "small" },
  { pr_id: "pr-020", developer_id: "dev-005", title: "feat: grafana templates",        opened_at: daysAgo(14), merged_at: daysAgo(13), first_review_at: daysAgo(13), size: "medium" },
  { pr_id: "pr-021", developer_id: "dev-005", title: "feat: terraform state",          opened_at: daysAgo(9),  merged_at: daysAgo(8),  first_review_at: daysAgo(8),  size: "large" },
  { pr_id: "pr-022", developer_id: "dev-005", title: "chore: helm upgrades",           opened_at: daysAgo(4),  merged_at: daysAgo(3),  first_review_at: daysAgo(3),  size: "small" },
];

// ─── Deployments ──────────────────────────────────────────────────────────────

export const deployments: Deployment[] = [
  // dev-001
  { deployment_id: "dep-001", pr_id: "pr-001", completed_at: daysAgo(24), status: "success" },
  { deployment_id: "dep-002", pr_id: "pr-002", completed_at: daysAgo(19), status: "success" },
  { deployment_id: "dep-003", pr_id: "pr-003", completed_at: daysAgo(13), status: "success" },
  { deployment_id: "dep-004", pr_id: "pr-004", completed_at: daysAgo(8),  status: "success" },
  { deployment_id: "dep-005", pr_id: "pr-005", completed_at: daysAgo(3),  status: "success" },

  // dev-002 (slow pipeline)
  { deployment_id: "dep-006", pr_id: "pr-006", completed_at: daysAgo(17), status: "success" },
  { deployment_id: "dep-007", pr_id: "pr-007", completed_at: daysAgo(5),  status: "failed"  },

  // dev-003 (review delay → large gap between pr open and deploy)
  { deployment_id: "dep-008", pr_id: "pr-008", completed_at: daysAgo(21), status: "success" },
  { deployment_id: "dep-009", pr_id: "pr-009", completed_at: daysAgo(14), status: "success" },
  { deployment_id: "dep-010", pr_id: "pr-010", completed_at: daysAgo(8),  status: "success" },
  { deployment_id: "dep-011", pr_id: "pr-011", completed_at: daysAgo(3),  status: "success" },

  // dev-004 (high frequency)
  { deployment_id: "dep-012", pr_id: "pr-012", completed_at: daysAgo(25), status: "success" },
  { deployment_id: "dep-013", pr_id: "pr-013", completed_at: daysAgo(20), status: "success" },
  { deployment_id: "dep-014", pr_id: "pr-014", completed_at: daysAgo(14), status: "success" },
  { deployment_id: "dep-015", pr_id: "pr-015", completed_at: daysAgo(8),  status: "rollback"},
  { deployment_id: "dep-016", pr_id: "pr-016", completed_at: daysAgo(3),  status: "success" },
  { deployment_id: "dep-017", pr_id: "pr-017", completed_at: daysAgo(1),  status: "success" },

  // dev-005
  { deployment_id: "dep-018", pr_id: "pr-018", completed_at: daysAgo(23), status: "success" },
  { deployment_id: "dep-019", pr_id: "pr-019", completed_at: daysAgo(17), status: "success" },
  { deployment_id: "dep-020", pr_id: "pr-020", completed_at: daysAgo(12), status: "success" },
  { deployment_id: "dep-021", pr_id: "pr-021", completed_at: daysAgo(7),  status: "success" },
  { deployment_id: "dep-022", pr_id: "pr-022", completed_at: daysAgo(2),  status: "success" },
];

// ─── Bugs ─────────────────────────────────────────────────────────────────────

export const bugs: Bug[] = [
  // dev-001 — 1 escaped bug out of 5 issues → 20% bug rate (acceptable)
  { bug_id: "bug-001", linked_issue_id: "iss-003", escaped_to_prod: true,  severity: "low"      },

  // dev-002 — 1 escaped bug out of 2 → 50% (high but small sample)
  { bug_id: "bug-002", linked_issue_id: "iss-006", escaped_to_prod: true,  severity: "medium"   },

  // dev-003 — 0 escaped bugs
  { bug_id: "bug-003", linked_issue_id: "iss-008", escaped_to_prod: false, severity: "low"      },

  // dev-004 — 3 escaped bugs out of 5 → 60% bug rate (critical signal)
  { bug_id: "bug-004", linked_issue_id: "iss-012", escaped_to_prod: true,  severity: "high"     },
  { bug_id: "bug-005", linked_issue_id: "iss-014", escaped_to_prod: true,  severity: "critical" },
  { bug_id: "bug-006", linked_issue_id: "iss-015", escaped_to_prod: true,  severity: "high"     },
  { bug_id: "bug-007", linked_issue_id: "iss-016", escaped_to_prod: false, severity: "medium"   },

  // dev-005 — 0 escaped bugs
  { bug_id: "bug-008", linked_issue_id: "iss-020", escaped_to_prod: false, severity: "low"      },
];

// ─── Historical baseline (previous 30-day window) ─────────────────────────────
// Stored as pre-computed metric snapshots for trend comparison

export const historicalBaseline: Record<string, {
  leadTime: number; cycleTime: number; prThroughput: number;
  deployFrequency: number; bugRate: number;
}> = {
  "dev-001": { leadTime: 4.2, cycleTime: 4.8, prThroughput: 4, deployFrequency: 4, bugRate: 0   },
  "dev-002": { leadTime: 9.5, cycleTime: 9.2, prThroughput: 3, deployFrequency: 3, bugRate: 33  },
  "dev-003": { leadTime: 5.0, cycleTime: 4.1, prThroughput: 3, deployFrequency: 3, bugRate: 25  },
  "dev-004": { leadTime: 2.8, cycleTime: 3.5, prThroughput: 4, deployFrequency: 4, bugRate: 50  },
  "dev-005": { leadTime: 2.3, cycleTime: 2.8, prThroughput: 4, deployFrequency: 5, bugRate: 0   },
};
