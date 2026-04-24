"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  AlertTriangle, CheckCircle, Zap, Info, ChevronLeft,
  Shield, ArrowRight, Target, Layers,
} from "lucide-react";
import type { Insight }        from "@/lib/engines/insights";
import type { Recommendation } from "@/lib/engines/recommendations";
import type { Developer }      from "@/lib/data/seed";

const SEVERITY_CFG = {
  critical: { Icon: AlertTriangle, label: "Critical" },
  warning:  { Icon: Zap,           label: "Warning"  },
  info:     { Icon: Info,          label: "Info"     },
  healthy:  { Icon: CheckCircle,   label: "Healthy"  },
};

export default function InsightDetailPage({
  params,
}: {
  params: Promise<{ developerId: string; insightId: string }>;
}) {
  const { developerId, insightId } = use(params);

  const [developers,     setDevelopers]     = useState<Developer[]>([]);
  const [insight,        setInsight]        = useState<Insight | null>(null);
  const [recommendations,setRecommendations]= useState<Recommendation[]>([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/developers").then(r => r.json()),
      fetch(`/api/insights/${developerId}`).then(r => r.json()),
      fetch(`/api/recommendations/${developerId}`).then(r => r.json()),
    ]).then(([devs, ins, rec]) => {
      setDevelopers(devs.developers);
      const found = (ins.insights as Insight[]).find(i => i.id === insightId);
      setInsight(found ?? null);
      const linked = (rec.recommendations as Recommendation[]).filter(r => r.linkedInsightId === insightId);
      setRecommendations(linked);
      setLoading(false);
    });
  }, [developerId, insightId]);

  const developer = developers.find(d => d.developer_id === developerId);

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <div style={{ width: 260, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-color)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px" }}>
        <div className="skeleton" style={{ height: 24, width: 200, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 280, borderRadius: 8, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
      </main>
    </div>
  );

  if (!insight) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-main)", marginBottom: 8 }}>Insight not found</h2>
        <Link href={`/dashboard/${developerId}`} style={{ color: "var(--brand-primary)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>← Back to dashboard</Link>
      </main>
    </div>
  );

  const cfg = SEVERITY_CFG[insight.severity];
  const SevIcon = cfg.Icon;
  const DIRECTION_ICONS: Record<string, string>  = { up: "↑", down: "↓", neutral: "→" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px", maxWidth: "calc(100vw - 260px)" }}>

        {/* Breadcrumb */}
        <Link href={`/dashboard/${developerId}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 14, fontWeight: 500, color: "var(--text-muted)", textDecoration: "none", marginBottom: 32,
        }}>
          <ChevronLeft size={16} />
          Back to {developer?.name}'s Dashboard
        </Link>

        {/* Insight hero card */}
        <div className="professional-card" style={{ padding: 40, marginBottom: 32 }}>

          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 32 }}>
            <div className={`severity-${insight.severity}`} style={{
              width: 56, height: 56, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <SevIcon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <span className={`tag severity-${insight.severity}`}>{cfg.label}</span>
                <span style={{
                  fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 6,
                  background: "var(--bg-subtle)", color: "var(--text-muted)",
                  border: "1px solid var(--border-color)",
                }}>
                  {insight.category}
                </span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.5px", lineHeight: 1.3 }}>
                {insight.title}
              </h1>
            </div>
          </div>

          {/* Explanation */}
          <div style={{
            background: "var(--bg-subtle)", border: "1px solid var(--border-color)",
            borderRadius: 8, padding: "24px", marginBottom: 32,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", marginBottom: 12 }}>
              Explanation
            </div>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>{insight.description}</p>
          </div>

          {/* Two-column: signals + confidence */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Signals */}
            <div style={{
              background: "var(--bg-main)", border: "1px solid var(--border-color)",
              borderRadius: 8, padding: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Layers size={16} color="var(--text-muted)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>
                  Supporting Signals
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {insight.signals.map((s, i) => {
                  const isUp = s.direction === "up";
                  const isDown = s.direction === "down";
                  const dirColor = isUp ? "var(--status-critical-fg)" : isDown ? "var(--status-healthy-fg)" : "var(--text-muted)";
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", borderRadius: 6,
                      background: "var(--bg-subtle)", border: "1px solid var(--border-color)",
                    }}>
                      <span style={{ fontSize: 14, color: "var(--text-main)", fontWeight: 500 }}>{s.metric}</span>
                      <span style={{
                        fontSize: 15, fontWeight: 600, color: dirColor,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {DIRECTION_ICONS[s.direction]} {s.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confidence */}
            <div style={{
              background: "var(--bg-main)", border: "1px solid var(--border-color)",
              borderRadius: 8, padding: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Shield size={16} color="var(--text-muted)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>
                  Confidence Analysis
                </span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Confidence Score</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: "var(--text-main)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {insight.confidence.toFixed(2)}
                  </span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }} />
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Confidence is derived from the deviation magnitude of each signal from the team baseline and historical average. Scores above 0.8 indicate a well-corroborated pattern.
              </div>
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", marginBottom: 12 }}>
                  Affected Metrics
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {insight.affectedMetrics.length > 0
                    ? insight.affectedMetrics.map(m => (
                        <span key={m} style={{
                          fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 6,
                          background: "var(--bg-subtle)", color: "var(--text-main)",
                          border: "1px solid var(--border-color)",
                        }}>{m}</span>
                      ))
                    : <span style={{ fontSize: 13, color: "var(--text-muted)" }}>All metrics within healthy range</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <Target size={20} color="var(--brand-primary)" />
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-main)" }}>
                Recommendations ({recommendations.length})
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {recommendations.map((rec) => (
                <div key={rec.id} className="professional-card" style={{ padding: 32 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-main)" }}>{rec.title}</h3>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <span className={`tag severity-${rec.impact === 'high' ? 'critical' : rec.impact === 'medium' ? 'warning' : 'healthy'}`}>
                        Impact: {rec.impact}
                      </span>
                      <span className="tag" style={{ background: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>
                        Effort: {rec.effort}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>{rec.rationale}</p>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                    Action Steps
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {rec.actions.map((action, ai) => (
                      <div key={ai} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "16px", borderRadius: 8,
                        background: "var(--bg-subtle)", border: "1px solid var(--border-color)",
                      }}>
                        <ArrowRight size={16} color="var(--text-subtle)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.5, fontWeight: 500 }}>{action}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-color)", fontSize: 13, color: "var(--text-muted)" }}>
                    Target metric: <span style={{ color: "var(--brand-primary)", fontWeight: 600, marginLeft: 4 }}>{rec.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
