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
  { key: "leadTime",        label: "Lead Time",        unit: "h",   color: "#8b5cf6", lowerBetter: true  },
  { key: "cycleTime",       label: "Cycle Time",       unit: "h",   color: "#3b82f6", lowerBetter: true  },
  { key: "prThroughput",   label: "PR Throughput",    unit: " PRs", color: "#06b6d4", lowerBetter: false },
  { key: "deployFrequency",label: "Deploy Frequency", unit: " dep", color: "#10b981", lowerBetter: false },
  { key: "bugRate",         label: "Bug Rate",         unit: "%",   color: "#f43f5e", lowerBetter: true  },
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

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <div style={{ width: 260, background: "#0d0d10", borderRight: "1px solid rgba(255,255,255,0.06)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "32px 40px" }}>
        <div className="skeleton" style={{ height: 48, width: 300, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 32 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
        </div>
        {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 220, marginBottom: 20, borderRadius: 16 }} />)}
      </main>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main style={{ marginLeft: 260, flex: 1, padding: "32px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f4f4f5", letterSpacing: "-0.4px", marginBottom: 4 }}>
            Trends — {developer?.name}
          </h1>
          <p style={{ fontSize: 14, color: "#52525b" }}>
            8-week rolling history · previous 30-day window vs current
          </p>
        </div>

        {/* Delta summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 36 }}>
          {deltas.map(d => {
            const improved = d.direction === "improved";
            const regressed = d.direction === "regressed";
            const color = improved ? "#10b981" : regressed ? "#f43f5e" : "#71717a";
            return (
              <div key={d.metric} style={{
                background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "16px 18px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  {d.metric}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#f4f4f5", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                  {d.current}{d.unit}
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 12, fontWeight: 600, color,
                  padding: "2px 8px", borderRadius: 99,
                  background: `${color}15`, border: `1px solid ${color}25`,
                }}>
                  {improved ? <TrendingUp size={11}/> : regressed ? <TrendingDown size={11}/> : <Minus size={11}/>}
                  {Math.abs(d.deltaPercent)}%
                </div>
                <div style={{ fontSize: 11, color: "#3f3f46", marginTop: 6 }}>
                  prev: {d.previous}{d.unit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Individual charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20, marginBottom: 20 }}>
          {CHARTS.map(({ key, label, unit, color, lowerBetter }) => {
            const vals = trendPoints.map(p => p[key] as number);
            const avg = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
            return (
              <div key={key} style={{
                background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 24,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>
                      {lowerBetter ? "Lower is better" : "Higher is better"}
                    </div>
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={trendPoints} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#71717a" }} itemStyle={{ color: "#f4f4f5" }}
                    />
                    <ReferenceLine y={avg} stroke={color} strokeDasharray="4 4" strokeOpacity={0.35} />
                    <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2}
                      dot={{ fill: color, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ fontSize: 11, color: "#52525b", marginTop: 8 }}>
                  Avg: <span style={{ color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    {avg.toFixed(1)}{unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-metric overlay */}
        <div style={{
          background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 24,
        }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5" }}>Lead Time vs Cycle Time Overlay</div>
            <div style={{ fontSize: 12, color: "#52525b", marginTop: 2 }}>
              Identifying the gap between development completion and deployment
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendPoints} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#52525b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1c1c22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#71717a" }} itemStyle={{ color: "#f4f4f5" }}
              />
              <Line type="monotone" dataKey="leadTime"  name="Lead Time (h)"  stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="cycleTime" name="Cycle Time (h)" stroke="#3b82f6" strokeWidth={2.5} dot={false} strokeDasharray="6 3" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
            {[{ c: "#8b5cf6", l: "Lead Time (solid)" }, { c: "#3b82f6", l: "Cycle Time (dashed)" }].map(x => (
              <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 2, background: x.c }} />
                <span style={{ fontSize: 11, color: "#52525b" }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
