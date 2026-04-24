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
  critical: { Icon: AlertTriangle, color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.22)", label: "Critical" },
  warning:  { Icon: Zap,           color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)", label: "Warning"  },
  info:     { Icon: Info,           color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.22)", label: "Info"     },
  healthy:  { Icon: CheckCircle,    color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.22)", label: "Healthy"  },
};

const IMPACT_COLORS = { high: "#f43f5e", medium: "#f59e0b", low: "#10b981" };

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
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <div style={{ width: 260, background: "#0d0d10", borderRight: "1px solid rgba(255,255,255,0.06)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "32px 40px" }}>
        <div className="skeleton" style={{ height: 32, width: 200, marginBottom: 32 }} />
        <div className="skeleton" style={{ height: 280, borderRadius: 16, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
      </main>
    </div>
  );

  if (!insight) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main style={{ marginLeft: 260, flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f4f4f5", marginBottom: 8 }}>Insight not found</h2>
        <Link href={`/dashboard/${developerId}`} style={{ color: "#8b5cf6", fontSize: 14 }}>← Back to dashboard</Link>
      </main>
    </div>
  );

  const cfg = SEVERITY_CFG[insight.severity];
  const SevIcon = cfg.Icon;
  const DIRECTION_ICONS: Record<string, string>  = { up: "↑", down: "↓", neutral: "→" };
  const DIRECTION_COLORS: Record<string, string> = { up: "#f43f5e", down: "#10b981", neutral: "#71717a" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main style={{ marginLeft: 260, flex: 1, padding: "32px 40px", maxWidth: "calc(100vw - 260px)" }}>

        {/* Breadcrumb */}
        <Link href={`/dashboard/${developerId}`} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#52525b", textDecoration: "none", marginBottom: 28,
          transition: "color 0.15s",
        }}>
          <ChevronLeft size={14} />
          Back to {developer?.name}'s Dashboard
        </Link>

        {/* Insight hero card */}
        <div style={{
          background: "#141418", border: `1px solid ${cfg.border}`,
          borderRadius: 20, padding: 32, marginBottom: 24, position: "relative", overflow: "hidden",
        }}>
          {/* Glow */}
          <div style={{
            position: "absolute", top: -60, right: -60, width: 200, height: 200,
            borderRadius: "50%", background: cfg.color, opacity: 0.04, filter: "blur(60px)",
          }} />

          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <SevIcon size={22} color={cfg.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span className={`tag severity-${insight.severity}`}>{cfg.label}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
                  background: "rgba(255,255,255,0.05)", color: "#71717a",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  {insight.category}
                </span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f4f4f5", letterSpacing: "-0.4px", lineHeight: 1.3 }}>
                {insight.title}
              </h1>
            </div>
          </div>

          {/* Explanation */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "18px 20px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              Explanation
            </div>
            <p style={{ fontSize: 15, color: "#a1a1aa", lineHeight: 1.7 }}>{insight.description}</p>
          </div>

          {/* Two-column: signals + confidence */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Signals */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <Layers size={13} color="#71717a" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Supporting Signals
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {insight.signals.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <span style={{ fontSize: 13, color: "#a1a1aa" }}>{s.metric}</span>
                    <span style={{
                      fontSize: 14, fontWeight: 700, color: DIRECTION_COLORS[s.direction],
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {DIRECTION_ICONS[s.direction]} {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <Shield size={13} color="#71717a" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Confidence Analysis
                </span>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#71717a" }}>Confidence Score</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#f4f4f5", fontFamily: "'JetBrains Mono', monospace" }}>
                    {insight.confidence.toFixed(2)}
                  </span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#52525b", lineHeight: 1.6 }}>
                Confidence is derived from the deviation magnitude of each signal from the team baseline and historical average. Scores above 0.8 indicate a well-corroborated pattern.
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#52525b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Affected Metrics
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {insight.affectedMetrics.length > 0
                    ? insight.affectedMetrics.map(m => (
                        <span key={m} style={{
                          fontSize: 12, padding: "3px 10px", borderRadius: 99,
                          background: "rgba(139,92,246,0.12)", color: "#a78bfa",
                          border: "1px solid rgba(139,92,246,0.25)",
                        }}>{m}</span>
                      ))
                    : <span style={{ fontSize: 12, color: "#52525b" }}>All metrics within healthy range</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Target size={16} color="#8b5cf6" />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5" }}>
                Recommendations ({recommendations.length})
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {recommendations.map((rec, i) => (
                <div key={rec.id} className="fade-in-up" style={{
                  background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16, padding: 24, animationDelay: `${i * 80}ms`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f4f4f5" }}>{rec.title}</h3>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                        background: `${IMPACT_COLORS[rec.impact]}15`, color: IMPACT_COLORS[rec.impact],
                        border: `1px solid ${IMPACT_COLORS[rec.impact]}30`,
                      }}>
                        Impact: {rec.impact}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                        background: "rgba(255,255,255,0.04)", color: "#71717a",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}>
                        Effort: {rec.effort}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.65, marginBottom: 18 }}>{rec.rationale}</p>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                    Action Steps
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {rec.actions.map((action, ai) => (
                      <div key={ai} style={{
                        display: "flex", alignItems: "flex-start", gap: 8,
                        padding: "10px 14px", borderRadius: 10,
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <ArrowRight size={13} color="#8b5cf6" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#a1a1aa", lineHeight: 1.5 }}>{action}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 12, color: "#52525b" }}>
                    Target metric: <span style={{ color: "#8b5cf6", fontWeight: 600 }}>{rec.metric}</span>
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
