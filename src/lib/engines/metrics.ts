import {
  developers, issues, pullRequests, deployments, bugs, historicalBaseline,
  type Developer,
} from "@/lib/data/seed";

export interface ComputedMetrics {
  developer: Developer;
  leadTime: number;          // hours avg
  cycleTime: number;         // hours avg
  prThroughput: number;      // merged PRs in window
  deployFrequency: number;   // successful deploys in window
  bugRate: number;           // percentage
  windowDays: number;
  // raw counts for insight engine
  totalIssues: number;
  totalPRs: number;
  totalDeploys: number;
  failedDeploys: number;
  escapedBugs: number;
  avgPRSize: string;
  avgReviewWait: number;     // hours between PR open → first review
}

// ─── Lead Time: PR opened → deployment completed ───────────────────────────────
function computeLeadTime(developerId: string): number {
  const devPRs = pullRequests.filter(
    (pr) => pr.developer_id === developerId && pr.merged_at
  );
  if (devPRs.length === 0) return 0;

  const leadTimes = devPRs.map((pr) => {
    const deployment = deployments.find((d) => d.pr_id === pr.pr_id);
    if (!deployment) return null;
    const opened = new Date(pr.opened_at).getTime();
    const completed = new Date(deployment.completed_at).getTime();
    return (completed - opened) / (1000 * 60 * 60); // hours
  }).filter((v): v is number => v !== null);

  if (leadTimes.length === 0) return 0;
  return +(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length).toFixed(1);
}

// ─── Cycle Time: issue in_progress → done ─────────────────────────────────────
function computeCycleTime(developerId: string): number {
  const devIssues = issues.filter(
    (i) => i.developer_id === developerId && i.done_at
  );
  if (devIssues.length === 0) return 0;

  const cycleTimes = devIssues.map((i) => {
    const start = new Date(i.in_progress_at).getTime();
    const end = new Date(i.done_at).getTime();
    return (end - start) / (1000 * 60 * 60);
  });

  return +(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length).toFixed(1);
}

// ─── PR Throughput: count of merged PRs ───────────────────────────────────────
function computePRThroughput(developerId: string): number {
  return pullRequests.filter(
    (pr) => pr.developer_id === developerId && pr.merged_at !== null
  ).length;
}

// ─── Deployment Frequency: count of successful deployments ─────────────────────
function computeDeployFrequency(developerId: string): number {
  const devPRIds = pullRequests
    .filter((pr) => pr.developer_id === developerId)
    .map((pr) => pr.pr_id);

  return deployments.filter(
    (d) => devPRIds.includes(d.pr_id) && d.status === "success"
  ).length;
}

// ─── Bug Rate: (escaped bugs / completed issues) * 100 ────────────────────────
function computeBugRate(developerId: string): number {
  const devIssueIds = issues
    .filter((i) => i.developer_id === developerId && i.done_at)
    .map((i) => i.issue_id);

  if (devIssueIds.length === 0) return 0;

  const escaped = bugs.filter(
    (b) => devIssueIds.includes(b.linked_issue_id) && b.escaped_to_prod
  ).length;

  return +((escaped / devIssueIds.length) * 100).toFixed(1);
}

// ─── Avg Review Wait ──────────────────────────────────────────────────────────
function computeAvgReviewWait(developerId: string): number {
  const devPRs = pullRequests.filter(
    (pr) => pr.developer_id === developerId && pr.first_review_at
  );
  if (devPRs.length === 0) return 0;

  const waits = devPRs.map((pr) => {
    const opened = new Date(pr.opened_at).getTime();
    const reviewed = new Date(pr.first_review_at!).getTime();
    return (reviewed - opened) / (1000 * 60 * 60);
  });

  return +(waits.reduce((a, b) => a + b, 0) / waits.length).toFixed(1);
}

// ─── Avg PR Size ──────────────────────────────────────────────────────────────
function computeAvgPRSize(developerId: string): string {
  const devPRs = pullRequests.filter((pr) => pr.developer_id === developerId);
  const counts = { small: 0, medium: 0, large: 0 };
  devPRs.forEach((pr) => counts[pr.size]++);
  const max = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return max[0];
}

// ─── Main compute function ─────────────────────────────────────────────────────
export function computeMetrics(developerId: string): ComputedMetrics | null {
  const developer = developers.find((d) => d.developer_id === developerId);
  if (!developer) return null;

  const devIssues = issues.filter((i) => i.developer_id === developerId && i.done_at);
  const devPRs    = pullRequests.filter((pr) => pr.developer_id === developerId);
  const devPRIds  = devPRs.map((pr) => pr.pr_id);
  const devDeploys = deployments.filter((d) => devPRIds.includes(d.pr_id));
  const devIssueIds = devIssues.map((i) => i.issue_id);
  const devBugs   = bugs.filter((b) => devIssueIds.includes(b.linked_issue_id));

  return {
    developer,
    leadTime:        computeLeadTime(developerId),
    cycleTime:       computeCycleTime(developerId),
    prThroughput:    computePRThroughput(developerId),
    deployFrequency: computeDeployFrequency(developerId),
    bugRate:         computeBugRate(developerId),
    windowDays:      30,
    totalIssues:     devIssues.length,
    totalPRs:        devPRs.filter((pr) => pr.merged_at).length,
    totalDeploys:    devDeploys.length,
    failedDeploys:   devDeploys.filter((d) => d.status === "failed" || d.status === "rollback").length,
    escapedBugs:     devBugs.filter((b) => b.escaped_to_prod).length,
    avgPRSize:       computeAvgPRSize(developerId),
    avgReviewWait:   computeAvgReviewWait(developerId),
  };
}

// ─── Team average (for baseline comparison) ───────────────────────────────────
export function computeTeamAverages(): Record<string, number> {
  const all = developers.map((d) => computeMetrics(d.developer_id)!);
  const avg = (key: keyof ComputedMetrics) => {
    const vals = all.map((m) => m[key] as number);
    return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };
  return {
    leadTime:        avg("leadTime"),
    cycleTime:       avg("cycleTime"),
    prThroughput:    avg("prThroughput"),
    deployFrequency: avg("deployFrequency"),
    bugRate:         avg("bugRate"),
  };
}

// ─── Historical baseline accessor ─────────────────────────────────────────────
export function getBaseline(developerId: string) {
  return historicalBaseline[developerId] ?? null;
}

export { developers };
