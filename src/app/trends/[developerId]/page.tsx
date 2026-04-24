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
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <div className="hidden md:block w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-default)]" />
      <main className="flex-1 w-full pt-20 px-4 md:pt-[40px] md:px-[40px] md:ml-[260px]">
        <div className="h-12 w-64 bg-[var(--bg-tertiary)] rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[1,2,3,4,5].map(i => <div key={i} className="h-32 bg-[var(--bg-tertiary)] rounded-2xl w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-[var(--bg-tertiary)] rounded-2xl w-full" />)}
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      
      <main className="flex-1 w-full pt-20 px-4 pb-10 md:pt-[40px] md:px-[40px] md:pb-[40px] md:ml-[260px] md:max-w-[calc(100vw-260px)] min-w-0">

        {/* Header */}
        <div className="mb-8 md:mb-[40px] pb-6 md:pb-[24px] border-b border-[var(--border-default)]">
          <h1 className="text-[24px] font-semibold text-[var(--text-primary)] tracking-[-0.5px] mb-[6px] truncate">
            Trends — {developer?.name}
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] break-words">
            8-week rolling history · previous 30-day window vs current
          </p>
        </div>

        {/* Delta summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-[16px] mb-10 md:mb-[40px]">
          {deltas.map(d => {
            const improved = d.direction === "improved";
            const regressed = d.direction === "regressed";
            const badgeClass = improved ? "badge-success" : regressed ? "badge-danger" : "badge-neutral";
            
            return (
              <div key={d.metric} className="premium-card p-5 md:p-[20px] w-full min-w-0 flex flex-col">
                <div className="text-[14px] font-medium text-[var(--text-secondary)] mb-[8px] truncate">
                  {d.metric}
                </div>
                <div className="font-mono text-[24px] font-semibold text-[var(--text-primary)] mb-[12px] truncate">
                  {d.current}<span className="text-[14px] font-sans ml-[2px] text-[var(--text-muted)]">{d.unit}</span>
                </div>
                <div className={`inline-flex items-center gap-[6px] w-fit px-[8px] py-[4px] rounded-[6px] text-[13px] font-medium ${badgeClass}`}>
                  {improved ? <TrendingDown size={14}/> : regressed ? <TrendingUp size={14}/> : <Minus size={14}/>}
                  <span>{Math.abs(d.deltaPercent)}%</span>
                </div>
                <div className="text-[12px] text-[var(--text-muted)] mt-auto pt-[12px] truncate">
                  Previous: {d.previous}{d.unit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Individual charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-[24px] mb-6 md:mb-[24px]">
          {CHARTS.map(({ key, label, unit, varName, lowerBetter }) => {
            const vals = trendPoints.map(p => p[key] as number);
            const avg = vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0;
            const chartColor = getCssVar(varName);

            return (
              <div key={key} className="premium-card p-6 md:p-[24px] w-full min-w-0">
                <div className="flex justify-between items-start mb-6 md:mb-[24px] gap-4">
                  <div className="min-w-0">
                    <div className="text-[16px] font-semibold text-[var(--text-primary)] mb-[4px] truncate">{label}</div>
                    <div className="text-[13px] text-[var(--text-secondary)] truncate">
                      {lowerBetter ? "Lower is better" : "Higher is better"}
                    </div>
                  </div>
                  <div className="w-[12px] h-[12px] rounded-full shrink-0" style={{ background: chartColor }} />
                </div>
                <div className="w-full h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendPoints} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
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
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
