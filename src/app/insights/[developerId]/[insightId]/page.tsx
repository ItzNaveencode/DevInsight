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
  critical: { Icon: AlertTriangle, label: "Critical", badge: "badge-danger" },
  warning:  { Icon: Zap,           label: "Warning",  badge: "badge-warning" },
  info:     { Icon: Info,          label: "Info",     badge: "badge-neutral" },
  healthy:  { Icon: CheckCircle,   label: "Healthy",  badge: "badge-success" },
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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ width: 260, background: "var(--bg-secondary)", borderRight: "1px solid var(--border-default)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px" }}>
        <div style={{ height: 24, width: 200, background: "var(--bg-tertiary)", marginBottom: 32 }} />
        <div style={{ height: 280, background: "var(--bg-tertiary)", borderRadius: 16, marginBottom: 24 }} />
        <div style={{ height: 200, background: "var(--bg-tertiary)", borderRadius: 16 }} />
      </main>
    </div>
  );

  if (!insight) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Insight not found</h2>
        <Link href={`/dashboard/${developerId}`} style={{ color: "var(--accent-primary)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>← Back to dashboard</Link>
      </main>
    </div>
  );

  const cfg = SEVERITY_CFG[insight.severity];
  const SevIcon = cfg.Icon;
  const DIRECTION_ICONS: Record<string, string>  = { up: "↑", down: "↓", neutral: "→" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px", maxWidth: "calc(100vw - 260px)" }}>

        {/* Breadcrumb */}
        <Link href={`/dashboard/${developerId}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 14, fontWeight: 500, color: "var(--text-muted)", textDecoration: "none", marginBottom: 32,
          transition: "color 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <ChevronLeft size={16} />
          Back to {developer?.name}'s Dashboard
        </Link>

        {/* Insight hero card */}
        <div className="hero-insight-card" style={{ padding: 40, marginBottom: 40 }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 32 }}>
            <div className={cfg.badge} style={{
              width: 56, height: 56, borderRadius: 12, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <SevIcon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span className={cfg.badge} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{cfg.label}</span>
                <span style={{
                  fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 6,
                  background: "var(--bg-tertiary)", color: "var(--text-secondary)",
                  border: "1px solid var(--border-light)",
                }}>
                  {insight.category}
                </span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.3 }}>
                {insight.title}
              </h1>
            </div>
          </div>

          {/* Explanation */}
          <div style={{
            background: "var(--bg-tertiary)", border: "1px solid var(--border-light)",
            borderRadius: 12, padding: "24px", marginBottom: 32,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
              Explanation
            </div>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>{insight.description}</p>
          </div>

          {/* Two-column: signals + confidence */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Signals */}
            <div style={{
              background: "var(--bg-secondary)", border: "1px solid var(--border-default)",
              borderRadius: 12, padding: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Layers size={18} color="var(--text-muted)" />
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                  Supporting Signals
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {insight.signals.map((s, i) => {
                  const isUp = s.direction === "up";
                  const isDown = s.direction === "down";
                  const dirColor = isUp ? "var(--semantic-danger)" : isDown ? "var(--semantic-success)" : "var(--text-secondary)";
                  const bgClass = isUp ? "var(--semantic-danger-bg)" : isDown ? "var(--semantic-success-bg)" : "var(--bg-tertiary)";
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", borderRadius: 8,
                      background: bgClass,
                    }}>
                      <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{s.metric}</span>
                      <span className="font-mono" style={{
                        fontSize: 15, fontWeight: 600, color: dirColor,
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
              background: "var(--bg-secondary)", border: "1px solid var(--border-default)",
              borderRadius: 12, padding: "24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Shield size={18} color="var(--text-muted)" />
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                  Confidence Analysis
                </span>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Confidence Score</span>
                  <span className="font-mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>
                    {insight.confidence.toFixed(2)}
                  </span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }} />
                </div>
              </div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Confidence is derived from the deviation magnitude of each signal from the team baseline and historical average. Scores above 0.8 indicate a well-corroborated pattern.
              </div>
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
                  Affected Metrics
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {insight.affectedMetrics.length > 0
                    ? insight.affectedMetrics.map(m => (
                        <span key={m} style={{
                          fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 6,
                          background: "var(--bg-tertiary)", color: "var(--text-secondary)",
                          border: "1px solid var(--border-light)",
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
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ padding: 6, background: "var(--bg-tertiary)", borderRadius: 6, color: "var(--accent-primary)" }}>
                <Target size={20} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>
                Recommendations ({recommendations.length})
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {recommendations.map((rec) => (
                <div key={rec.id} className="premium-card" style={{ padding: 32 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{rec.title}</h3>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <span className={`badge-${rec.impact === 'high' ? 'danger' : rec.impact === 'medium' ? 'warning' : 'success'}`} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                        Impact: {rec.impact}
                      </span>
                      <span className="badge-neutral" style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                        Effort: {rec.effort}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>{rec.rationale}</p>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                    Action Steps
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {rec.actions.map((action, ai) => (
                      <div key={ai} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "16px", borderRadius: 8,
                        background: "var(--bg-tertiary)", border: "1px solid var(--border-light)",
                      }}>
                        <ArrowRight size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5, fontWeight: 500 }}>{action}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--border-default)", fontSize: 14, color: "var(--text-secondary)" }}>
                    Target metric: <span style={{ color: "var(--accent-primary)", fontWeight: 600, marginLeft: 4 }}>{rec.metric}</span>
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
