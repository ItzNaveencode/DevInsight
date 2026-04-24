"use client";

import { useEffect, useState, use } from "react";
import Sidebar from "@/components/Sidebar";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TrendPoint, TrendDelta } from "@/lib/engines/trends";
import type { Developer } from "@/lib/data/seed";

const CHARTS = [
  { key: "leadTime",        label: "Lead Time",        unit: "h",   varName: "--chart-lead",   lowerBetter: true  },
  { key: "cycleTime",       label: "Cycle Time",       unit: "h",   varName: "--chart-cycle",  lowerBetter: true  },
  { key: "prThroughput",   label: "PR Throughput",    unit: " PRs", varName: "--chart-pr",     lowerBetter: false },
  { key: "deployFrequency",label: "Deploy Frequency", unit: " dep", varName: "--chart-deploy", lowerBetter: false },
  { key: "bugRate",         label: "Bug Rate",         unit: "%",   varName: "--chart-bug",    lowerBetter: true  },
] as const;

export default function TrendsPage({ params }: { params: Promise<{ developerId: string }> }) {
  const { developerId } = use(params);
  const [developers,  setDevelopers]  = useState<Developer[]>([]);
  const [trendPoints, setTrendPoints] = useState<TrendPoint[]>([]);
  const [deltas,      setDeltas]      = useState<TrendDelta[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/developers").then(r => r.json()),
      fetch(`/api/trends/${developerId}`).then(r => r.json()),
    ]).then(([devs, trn]) => {
      setDevelopers(devs.developers);
      setTrendPoints(trn.trendPoints);
      setDeltas(trn.deltas);
      setLoading(false);
    });
  }, [developerId]);

  const developer = developers.find(d => d.developer_id === developerId);

  // Helper to get CSS variable value dynamically for Recharts
  const getCssVar = (name: string) => {
    if (typeof window !== "undefined") {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
    return "#8b5cf6"; // Fallback
  };

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <div style={{ width: 260, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-color)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px" }}>
        <div className="skeleton" style={{ height: 48, width: 300, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 32 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
        </div>
        {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 240, marginBottom: 20, borderRadius: 8 }} />)}
      </main>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.5px", marginBottom: 6 }}>
            Trends — {developer?.name}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            8-week rolling history · previous 30-day window vs current
          </p>
        </div>

        {/* Delta summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 36 }}>
          {deltas.map(d => {
            const improved = d.direction === "improved";
            const regressed = d.direction === "regressed";
            const bgClass = improved ? "var(--status-healthy-bg)" : regressed ? "var(--status-critical-bg)" : "var(--bg-subtle)";
            const fgClass = improved ? "var(--status-healthy-fg)" : regressed ? "var(--status-critical-fg)" : "var(--text-muted)";
            
            return (
              <div key={d.metric} className="professional-card" style={{ padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                  {d.metric}
                </div>
                <div style={{ fontSize: 24, fontWeight: 600, color: "var(--text-main)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                  {d.current}{d.unit}
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600, color: fgClass,
                  padding: "4px 8px", borderRadius: 6, background: bgClass,
                }}>
                  {improved ? <TrendingDown size={14}/> : regressed ? <TrendingUp size={14}/> : <Minus size={14}/>}
                  {Math.abs(d.deltaPercent)}%
                </div>
                <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 10 }}>
                  Previous: {d.previous}{d.unit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Individual charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20, marginBottom: 20 }}>
          {CHARTS.map(({ key, label, unit, varName, lowerBetter }) => {
            const vals = trendPoints.map(p => p[key] as number);
            const avg = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
            const chartColor = getCssVar(varName);

            return (
              <div key={key} className="professional-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-main)", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: "var(--text-subtle)" }}>
                      {lowerBetter ? "Lower is better" : "Higher is better"}
                    </div>
                  </div>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: chartColor }} />
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={trendPoints} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 6, fontSize: 13, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }} itemStyle={{ color: "var(--text-main)", fontWeight: 600 }}
                    />
                    <ReferenceLine y={avg} stroke={chartColor} strokeDasharray="4 4" strokeOpacity={0.5} />
                    <Line type="monotone" dataKey={key} stroke={chartColor} strokeWidth={2.5}
                      dot={{ fill: "var(--bg-card)", stroke: chartColor, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0, fill: chartColor }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ fontSize: 13, color: "var(--text-subtle)", marginTop: 16 }}>
                  Average: <span style={{ color: "var(--text-main)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    {avg.toFixed(1)}{unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-metric overlay */}
        <div className="professional-card" style={{ padding: 24, marginTop: 20 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-main)", marginBottom: 4 }}>Lead Time vs Cycle Time Overlay</div>
            <div style={{ fontSize: 13, color: "var(--text-subtle)" }}>
              Identifying the gap between development completion and deployment
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendPoints} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 6, fontSize: 13, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                labelStyle={{ color: "var(--text-muted)", marginBottom: 4 }} itemStyle={{ color: "var(--text-main)", fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="leadTime"  name="Lead Time (h)"  stroke={getCssVar("--chart-lead")} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="cycleTime" name="Cycle Time (h)" stroke={getCssVar("--chart-cycle")} strokeWidth={2.5} dot={false} strokeDasharray="6 4" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
            {[{ c: getCssVar("--chart-lead"), l: "Lead Time (solid)" }, { c: getCssVar("--chart-cycle"), l: "Cycle Time (dashed)" }].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 16, height: 3, background: x.c, borderRadius: 2 }} />
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
