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
  { key: "leadTime",        label: "Lead Time",        unit: "h",   varName: "--accent-primary",   lowerBetter: true  },
  { key: "cycleTime",       label: "Cycle Time",       unit: "h",   varName: "--semantic-warning",  lowerBetter: true  },
  { key: "prThroughput",   label: "PR Throughput",    unit: " PRs", varName: "--semantic-success",     lowerBetter: false },
  { key: "deployFrequency",label: "Deploy Frequency", unit: " dep", varName: "--accent-hover", lowerBetter: false },
  { key: "bugRate",         label: "Bug Rate",         unit: "%",   varName: "--semantic-danger",    lowerBetter: true  },
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

  const getCssVar = (name: string) => {
    if (typeof window !== "undefined") {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
    return "#6366F1";
  };

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ width: 260, background: "var(--bg-secondary)", borderRight: "1px solid var(--border-default)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px" }}>
        <div style={{ height: 48, width: 300, background: "var(--bg-tertiary)", marginBottom: 32, borderRadius: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 32 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height: 110, background: "var(--bg-tertiary)", borderRadius: 16 }} />)}
        </div>
      </main>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px", maxWidth: "calc(100vw - 260px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "1px solid var(--border-default)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 6 }}>
            Trends — {developer?.name}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            8-week rolling history · previous 30-day window vs current
          </p>
        </div>

        {/* Delta summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 40 }}>
          {deltas.map(d => {
            const improved = d.direction === "improved";
            const regressed = d.direction === "regressed";
            const badgeClass = improved ? "badge-success" : regressed ? "badge-danger" : "badge-neutral";
            
            return (
              <div key={d.metric} className="premium-card" style={{ padding: "20px" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>
                  {d.metric}
                </div>
                <div className="font-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
                  {d.current}<span style={{ fontSize: 14, fontFamily: "Inter", marginLeft: 2, color: "var(--text-muted)" }}>{d.unit}</span>
                </div>
                <div className={badgeClass} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 500, padding: "4px 8px", borderRadius: 6,
                }}>
                  {improved ? <TrendingDown size={14}/> : regressed ? <TrendingUp size={14}/> : <Minus size={14}/>}
                  {Math.abs(d.deltaPercent)}%
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                  Previous: {d.previous}{d.unit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Individual charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24, marginBottom: 24 }}>
          {CHARTS.map(({ key, label, unit, varName, lowerBetter }) => {
            const vals = trendPoints.map(p => p[key] as number);
            const avg = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
            const chartColor = getCssVar(varName);

            return (
              <div key={key} className="premium-card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {lowerBetter ? "Lower is better" : "Higher is better"}
                    </div>
                  </div>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: chartColor }} />
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={trendPoints} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", borderRadius: 8, fontSize: 13, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                      labelStyle={{ color: "var(--text-secondary)", marginBottom: 4 }} itemStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
                    />
                    <ReferenceLine y={avg} stroke={chartColor} strokeDasharray="4 4" strokeOpacity={0.5} />
                    <Line type="monotone" dataKey={key} stroke={chartColor} strokeWidth={2.5}
                      dot={{ fill: "var(--bg-secondary)", stroke: chartColor, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0, fill: chartColor }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
