import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GitCommitHorizontal, GitPullRequest, Star, Code2, Users, ArrowUpRight, BookOpen, ExternalLink, Sparkles, Zap, ChevronDown } from "lucide-react";
import { featuredSystems, githubAccounts, repositorySignals } from "../../content/portfolio";
import type { RepositorySignal } from "../../content/portfolio";
import {
  getRankedRepositories,
  getRepositoryThemes,
  getTopRepository,
} from "../../features/github/repo-intelligence";
import { compactActionLabel, getSystemRouteHref } from "../../lib/utils";
import { Button } from "../ui/button";
import { FiscalMindsetBadge } from "../ui/fiscalmindset-badge";
import { GitHubCommitSurface } from "../ui/github-commit-surface";
import { SectionHeading } from "../ui/section-heading";

const SIGNAL_LABELS: Record<string, string> = {
  completeness: "Complete",
  executionDepth: "Execution",
  aiDepth: "AI Depth",
  productSignal: "Product",
  recencySignal: "Recency",
};

const SIGNAL_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899"];

const PR_TIMELINE = [
  { date: "May 24", prs: 1, cumulative: 1 },
  { date: "May 25", prs: 1, cumulative: 2 },
  { date: "May 26", prs: 1, cumulative: 3 },
  { date: "May 27", prs: 1, cumulative: 4 },
  { date: "May 28", prs: 2, cumulative: 6 },
  { date: "May 29", prs: 1, cumulative: 7 },
  { date: "May 31", prs: 1, cumulative: 8 },
  { date: "Jun 1", prs: 2, cumulative: 10 },
  { date: "Jun 2", prs: 1, cumulative: 11 },
  { date: "Jun 4", prs: 3, cumulative: 14 },
  { date: "Jun 6", prs: 1, cumulative: 15 },
  { date: "Jun 8", prs: 2, cumulative: 17 },
  { date: "Jun 9", prs: 2, cumulative: 19 },
];

function SignalProfileChart({ signals, size = "sm" }: { signals: RepositorySignal; size?: "sm" | "md" }) {
  const dims = size === "sm" ? { w: 140, h: 48, barW: 16, gap: 8, base: 44 } : { w: 200, h: 64, barW: 24, gap: 12, base: 58 };
  const keys = ["completeness", "executionDepth", "aiDepth", "productSignal", "recencySignal"] as const;
  return (
    <svg width={dims.w} height={dims.h} viewBox={`0 0 ${dims.w} ${dims.h}`} className="shrink-0">
      {keys.map((k, i) => {
        const val = signals[k];
        const x = i * (dims.barW + dims.gap) + 4;
        const barH = val * (dims.base - 4);
        return (
          <g key={k}>
            <rect x={x} y={dims.base - barH} width={dims.barW} height={barH} rx={2} fill={SIGNAL_COLORS[i]} opacity={0.7}>
              <animate attributeName="height" from="0" to={barH} dur="0.4s" fill="freeze" />
              <animate attributeName="y" from={dims.base} to={dims.base - barH} dur="0.4s" fill="freeze" />
            </rect>
            <text x={x + dims.barW / 2} y={dims.base + (size === "sm" ? 3 : 4)} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={size === "sm" ? 4 : 5} fontFamily="monospace">
              {SIGNAL_LABELS[k].slice(0, 3)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function InteractiveScoreChart({ repos, selectedId, onSelect }: {
  repos: { id: string; title: string; score: number; account: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const maxScore = Math.max(...repos.map(r => r.score), 0.01);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [chartMode, setChartMode] = useState<"bars" | "matrix">("bars");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerW(entry.contentRect.width));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, [repos.length]);

  const chartW = Math.min(containerW - 24 || 400, 700);
  const chartH = containerW < 500 ? 140 : 180;
  const barAreaW = Math.max(chartW - 40, 200);
  const n = repos.length;
  const barGap = n > 15 ? 3 : n > 10 ? 6 : n > 5 ? 10 : 16;
  const barW = Math.max(6, Math.min(36, (barAreaW - (n - 1) * barGap) / n));
  const totalW = n * barW + (n - 1) * barGap;
  const offsetX = 32 + (chartW - totalW - 32) / 2;
  const labelInterval = containerW < 400 ? 4 : containerW < 600 ? 3 : 2;

  const tiers = [
    { label: "80–100", min: 0.8, max: 1, color: "#10b981" },
    { label: "60–80", min: 0.6, max: 0.8, color: "#f59e0b" },
    { label: "40–60", min: 0.4, max: 0.6, color: "#6366f1" },
    { label: "20–40", min: 0.2, max: 0.4, color: "#8b5cf6" },
    { label: "0–20", min: 0, max: 0.2, color: "#ec4899" },
  ];

  const matrixCols = containerW < 400 ? 4 : containerW < 600 ? 5 : 6;
  const matrixGap = 4;
  const matrixCell = Math.max(40, Math.floor((Math.max(containerW - 24, 280) - (matrixCols - 1) * matrixGap - 16) / matrixCols));
  const matrixRows = Math.ceil(repos.length / matrixCols);

  return (
    <div ref={containerRef} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1.5">
        <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted/50">
          {chartMode === "bars" ? "Score distribution" : "Score matrix"}
        </div>
        <div className="flex gap-1">
          <button className={`rounded-full border px-2 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] transition ${chartMode === "bars" ? "border-accent/40 bg-accent/12 text-ink" : "border-white/[0.08] text-muted/50 hover:text-ink"}`} onClick={() => setChartMode("bars")}>Bars</button>
          <button className={`rounded-full border px-2 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] transition ${chartMode === "matrix" ? "border-accent/40 bg-accent/12 text-ink" : "border-white/[0.08] text-muted/50 hover:text-ink"}`} onClick={() => setChartMode("matrix")}>Matrix</button>
        </div>
      </div>

      <div className="text-[8px] font-mono text-muted/40 mb-2">Click a bar or cell to jump to repo</div>

      {chartMode === "bars" ? (
        <div className="overflow-x-auto">
          <svg width={chartW} height={chartH} className="overflow-visible block">
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <g key={v}>
                <line x1={26} y1={chartH - 18 - v * (chartH - 32)} x2={chartW - 8} y2={chartH - 18 - v * (chartH - 32)} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                <text x={24} y={chartH - 18 - v * (chartH - 32) + 1.5} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize={5} fontFamily="monospace">{Math.round(v * 100)}</text>
              </g>
            ))}
            {repos.map((r, i) => {
              const barH = Math.max(2, (r.score / maxScore) * (chartH - 32));
              const x = offsetX + i * (barW + barGap);
              const y = chartH - 18 - barH;
              const isSelected = r.id === selectedId;
              const scoreColor = r.score > 0.8 ? "#10b981" : r.score > 0.6 ? "#f59e0b" : "#6366f1";
              return (
                <g key={r.id} className="cursor-pointer" onClick={() => onSelect(r.id)}>
                  <rect x={x} y={y} width={barW} height={Math.max(barH, 2)} rx={1.5} fill={isSelected ? scoreColor : `${scoreColor}55`} stroke={isSelected ? scoreColor : "none"} strokeWidth={isSelected ? 1 : 0}>
                    <animate attributeName="height" from="0" to={Math.max(barH, 2)} dur="0.5s" fill="freeze" />
                    <animate attributeName="y" from={chartH - 18} to={y} dur="0.5s" fill="freeze" />
                  </rect>
                  {isSelected && <line x1={x + barW / 2} y1={y - 3} x2={x + barW / 2} y2={y - 7} stroke={scoreColor} strokeWidth="1" />}
                  {barW > 8 && i % labelInterval === 0 && (
                    <text x={x + barW / 2} y={chartH - 4} textAnchor="middle" fill={isSelected ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)"} fontSize={4.5} fontFamily="monospace" transform={`rotate(-45 ${x + barW / 2} ${chartH - 4})`}>
                      {r.title.length > 6 ? r.title.slice(0, 5) + "…" : r.title}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg width={Math.max(containerW - 24, 280)} height={matrixRows * (matrixCell + matrixGap) + 24} className="block">
            {repos.map((r, i) => {
              const row = Math.floor(i / matrixCols);
              const col = i % matrixCols;
              const gridW = matrixCols * (matrixCell + matrixGap) - matrixGap;
              const mx = Math.max(0, (Math.max(containerW - 24, 280) - gridW) / 2);
              const x = mx + col * (matrixCell + matrixGap);
              const y = row * (matrixCell + matrixGap) + 20;
              const isSelected = r.id === selectedId;
              const tier = tiers.find(t => r.score >= t.min && r.score < t.max) ?? tiers[tiers.length - 1];
              const opacity = isSelected ? 1 : 0.4 + r.score * 0.5;
              return (
                <g key={r.id} className="cursor-pointer" onClick={() => onSelect(r.id)}>
                  <rect x={x} y={y} width={matrixCell} height={matrixCell} rx={4} fill={tier.color} opacity={opacity} stroke={isSelected ? tier.color : "rgba(255,255,255,0.06)"} strokeWidth={isSelected ? 1.5 : 0.5} />
                  <text x={x + matrixCell / 2} y={y + matrixCell / 2 - 3} textAnchor="middle" fill="#fff" fontSize={matrixCell > 64 ? 7 : 6} fontFamily="monospace" fontWeight={isSelected ? "bold" : "normal"}>
                    {r.title.length > 5 ? r.title.slice(0, 4) + "…" : r.title}
                  </text>
                  <text x={x + matrixCell / 2} y={y + matrixCell / 2 + 8} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={5} fontFamily="monospace">
                    {Math.round(r.score * 100)}%
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-2 mt-2">
            {tiers.map(t => (
              <span key={t.label} className="flex items-center gap-1 font-mono text-[7px] text-muted/50">
                <span className="h-2 w-2 rounded" style={{ backgroundColor: t.color }} /> {t.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AccountSignalChart({ signals1, signals2, label1, label2 }: {
  signals1: RepositorySignal[];
  signals2: RepositorySignal[];
  label1: string;
  label2: string;
}) {
  const keys = ["completeness", "executionDepth", "aiDepth", "productSignal", "recencySignal"] as const;
  const formatPct = (v: number) => `${Math.round(v * 100)}%`;
  const avg1 = useMemo(() => keys.map(k => signals1.reduce((s, r) => s + r[k], 0) / Math.max(signals1.length, 1)), [signals1]);
  const avg2 = useMemo(() => keys.map(k => signals2.reduce((s, r) => s + r[k], 0) / Math.max(signals2.length, 1)), [signals2]);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [focusedBar, setFocusedBar] = useState<string | null>(null);

  const chartW = 280;
  const chartH = 140;
  const groupW = (chartW - 40) / keys.length;
  const barW = groupW * 0.35;
  const activeKey = focusedBar ?? hoveredBar;

  return (
    <div>
      <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="w-full overflow-visible">
        {[0, 0.5, 1].map((v) => (
          <g key={v}>
            <line x1={32} y1={chartH - 22 - v * (chartH - 34)} x2={chartW - 10} y2={chartH - 22 - v * (chartH - 34)} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <text x={30} y={chartH - 22 - v * (chartH - 34) + 1.5} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize={5} fontFamily="monospace">{Math.round(v * 100)}</text>
          </g>
        ))}
        {activeKey && (
          <g>
            <rect x={chartW - 88} y={2} width={82} height={28} rx={4} fill="rgba(0,0,0,0.75)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <text x={chartW - 84} y={13} fill="#10b981" fontSize={5.5} fontFamily="monospace">{label1}: {formatPct(avg1[keys.indexOf(activeKey as typeof keys[number])])}</text>
            <text x={chartW - 84} y={23} fill="#8b5cf6" fontSize={5.5} fontFamily="monospace">{label2}: {formatPct(avg2[keys.indexOf(activeKey as typeof keys[number])])}</text>
          </g>
        )}
        {keys.map((k, i) => {
          const x = 32 + i * groupW + groupW * 0.15;
          const h1 = avg1[i] * (chartH - 34);
          const h2 = avg2[i] * (chartH - 34);
          const isActive = activeKey === k;
          return (
            <g key={k} className="cursor-pointer" onMouseEnter={() => setHoveredBar(k)} onMouseLeave={() => setHoveredBar(null)} onClick={() => setFocusedBar(focusedBar === k ? null : k)}>
              <rect x={x - 4} y={0} width={groupW} height={chartH} fill="transparent" />
              <rect x={x} y={chartH - 22 - h1} width={barW} height={Math.max(h1, 2)} rx={1.5} fill="#10b981" opacity={isActive ? 1 : 0.6}>
                <animate attributeName="height" from="0" to={Math.max(h1, 2)} dur="0.4s" fill="freeze" />
                <animate attributeName="y" from={chartH - 22} to={chartH - 22 - Math.max(h1, 2)} dur="0.4s" fill="freeze" />
              </rect>
              {isActive && <text x={x + barW / 2} y={chartH - 22 - h1 - 3} textAnchor="middle" fill="#10b981" fontSize={5} fontFamily="monospace">{formatPct(avg1[i])}</text>}
              <rect x={x + barW + 2} y={chartH - 22 - h2} width={barW} height={Math.max(h2, 2)} rx={1.5} fill="#8b5cf6" opacity={isActive ? 1 : 0.6}>
                <animate attributeName="height" from="0" to={Math.max(h2, 2)} dur="0.4s" fill="freeze" />
                <animate attributeName="y" from={chartH - 22} to={chartH - 22 - Math.max(h2, 2)} dur="0.4s" fill="freeze" />
              </rect>
              {isActive && <text x={x + barW + 2 + barW / 2} y={chartH - 22 - h2 - 3} textAnchor="middle" fill="#8b5cf6" fontSize={5} fontFamily="monospace">{formatPct(avg2[i])}</text>}
              <text x={x + barW + 1} y={chartH - 6} textAnchor="middle" fill={isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)"} fontSize={5} fontFamily="monospace">{SIGNAL_LABELS[k].slice(0, 3)}</text>
            </g>
          );
        })}
        <line x1={10} y1={8} x2={20} y2={8} stroke="#10b981" strokeWidth="2" />
        <text x={22} y={9.5} fill="rgba(255,255,255,0.4)" fontSize={5} fontFamily="monospace">{label1}</text>
        <line x1={10} y1={16} x2={20} y2={16} stroke="#8b5cf6" strokeWidth="2" />
        <text x={22} y={17.5} fill="rgba(255,255,255,0.4)" fontSize={5} fontFamily="monospace">{label2}</text>
      </svg>
      <div className="flex items-center justify-between text-[7px] font-mono text-muted/30 mt-1">
        <span>Hover for values · click to pin</span>
        <span>{signals1.length} repos vs {signals2.length} avg</span>
      </div>
    </div>
  );
}

function CoralMCPAnalysis({ prs }: { prs: { name: string; pr: string; status: string; description: string }[] }) {
  const merged = prs.filter(p => p.status === "merged").length;
  const open = prs.filter(p => p.status === "open").length;
  const closed = prs.filter(p => p.status === "closed").length;
  const [chartMode, setChartMode] = useState<"timeline" | "status">("timeline");

  const chartH = 130;
  const chartW = 400;

  /* Timeline chart */
  const maxPrs = Math.max(...PR_TIMELINE.map(d => d.prs), 1);
  const maxCum = PR_TIMELINE[PR_TIMELINE.length - 1].cumulative;
  const barW = Math.min(22, Math.max(6, (chartW - 30) / PR_TIMELINE.length - 4));

  /* Status stacked bar segments */
  const total = prs.length;
  const statusData = [
    { label: "Merged", count: merged, color: "#10b981" },
    { label: "Open", count: open, color: "#f59e0b" },
    { label: "Closed", count: closed, color: "#6b7280" },
  ].filter(d => d.count > 0);

  /* Type breakdown */
  const featCount = prs.filter(p => p.description.startsWith("feat") || p.description.startsWith("New") || !p.description.startsWith("docs")).length;
  const docsCount = prs.filter(p => p.description.startsWith("docs") || p.description.startsWith("Documentation")).length;
  const typeMax = Math.max(featCount, docsCount, 1);

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <GitPullRequest size={13} />
          </div>
          <div>
            <div className="font-semibold text-ink text-sm">Coral MCP Analysis</div>
            <div className="text-[10px] font-mono text-muted/50">19 contributions · hover/click charts</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {(["timeline", "status"] as const).map((m) => (
            <button key={m} className={`rounded-full border px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] transition ${chartMode === m ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-400" : "border-white/[0.08] text-muted/50 hover:text-ink"}`} onClick={() => setChartMode(m)}>
              {m === "timeline" ? "Timeline" : "Breakdown"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
        {/* Main chart area */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          {chartMode === "timeline" ? (
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted/40 mb-2">PRs per day · {maxCum} total cumulative</div>
              <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible w-full">
                {[0, Math.round(maxPrs / 2), maxPrs].filter(v => v > 0).map((v) => (
                  <g key={v}>
                    <line x1={28} y1={chartH - 18 - (v / maxPrs) * (chartH - 28)} x2={chartW - 10} y2={chartH - 18 - (v / maxPrs) * (chartH - 28)} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                    <text x={26} y={chartH - 18 - (v / maxPrs) * (chartH - 28) + 1.5} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize={5} fontFamily="monospace">{v}</text>
                  </g>
                ))}
                {/* Cumulative line */}
                <polyline
                  points={PR_TIMELINE.map((d, i) => {
                    const x = 28 + i * ((chartW - 38) / (PR_TIMELINE.length - 1));
                    const y = chartH - 18 - (d.cumulative / maxCum) * (chartH - 28);
                    return `${x},${y}`;
                  }).join(" ")}
                  fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" opacity={0.5}
                />
                {PR_TIMELINE.map((d, i) => {
                  const x = 28 + i * ((chartW - 38) / (PR_TIMELINE.length - 1));
                  const barH = (d.prs / maxPrs) * (chartH - 28);
                  const label = i % 3 === 0 || i === PR_TIMELINE.length - 1;
                  return (
                    <g key={d.date}>
                      <rect x={x - barW / 2} y={chartH - 18 - barH} width={barW} height={Math.max(barH, 2)} rx={1.5} fill="#3b82f6" opacity={0.7} />
                      {label && (
                        <text x={x} y={chartH - 4} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={4.5} fontFamily="monospace" transform={`rotate(-30 ${x} ${chartH - 4})`}>
                          {d.date}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div>
              <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted/40 mb-2">Status · type distribution</div>
              <div className="space-y-3">
                <div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted/50 mb-1.5">By status</div>
                  <div className="flex h-5 rounded-full overflow-hidden">
                    {statusData.map(d => (
                      <motion.div key={d.label} initial={{ width: 0 }} animate={{ width: `${(d.count / total) * 100}%` }} transition={{ duration: 0.5 }} style={{ backgroundColor: d.color, opacity: 0.8 }} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {statusData.map(d => (
                      <span key={d.label} className="flex items-center gap-1 font-mono text-[8px] text-muted/50">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.label} {d.count}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted/50 mb-1.5">By type</div>
                  <div className="space-y-1">
                    {[{ label: "feat (sources)", count: featCount, color: "#3b82f6" }, { label: "docs", count: docsCount, color: "#f59e0b" }].map(d => (
                      <div key={d.label} className="flex items-center gap-2">
                        <span className="w-20 truncate font-mono text-[8px] text-muted/60">{d.label}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(d.count / typeMax) * 100}%` }} transition={{ duration: 0.4 }} style={{ backgroundColor: d.color, opacity: 0.7 }} />
                        </div>
                        <span className="font-mono text-[8px] text-muted/50 w-4 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid gap-2">
          {[
            { label: "Merged", value: merged, color: "#10b981", desc: "Shipped to production" },
            { label: "Open", value: open, color: "#f59e0b", desc: "In review" },
            { label: "Closed", value: closed, color: "#6b7280", desc: "Without merge" },
          ].filter(d => d.value > 0).map(d => (
            <motion.div key={d.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 flex items-center gap-3" whileHover={{ scale: 1.01 }}>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: `${d.color}18` }}>
                <span className="text-sm font-bold" style={{ color: d.color }}>{d.value}</span>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink/80">{d.label}</div>
                <div className="text-[8px] text-muted/50">{d.desc}</div>
              </div>
              <div className="ml-auto font-mono text-[8px] text-muted/30">{Math.round((d.value / total) * 100)}%</div>
            </motion.div>
          ))}
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-2.5">
            <div className="font-mono text-[7px] uppercase tracking-[0.15em] text-muted/40">Span</div>
            <div className="text-[10px] text-ink mt-0.5">May 24 → Jun 9, 2026</div>
            <div className="text-[8px] text-muted/50">17 days of contributions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

type StatBarProps = { label: string; value: number; max: number; color: string };

function StatBar({ label, value, max, color }: StatBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted/60">{label}</span>
        <span className="font-mono text-[11px] text-ink font-semibold">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div className="h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, ease: "easeOut" }} style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      </div>
    </div>
  );
}

function AccountStatCard({ account, primary, repoSignals }: { account: typeof githubAccounts[0]; primary: boolean; repoSignals: RepositorySignal[] }) {
  const [expanded, setExpanded] = useState(false);
  const stats = [
    { label: "Commits", value: account.handle === "fiscalmindset" ? 124 : 582, max: 600, color: primary ? "#10b981" : "#6366f1" },
    { label: "Repos", value: account.handle === "fiscalmindset" ? 20 : 100, max: 120, color: primary ? "#f59e0b" : "#8b5cf6" },
    { label: "Stars", value: account.handle === "fiscalmindset" ? 8 : 10, max: 20, color: primary ? "#3b82f6" : "#ec4899" },
  ];
  const accountRepos = repoSignals.filter(r => (account.handle === "fiscalmindset" ? r.account === "FiscalMindset" : r.account === "algsoch"));

  return (
    <motion.div layout className={`rounded-2xl border p-4 cursor-pointer transition-all ${primary ? "border-emerald-500/25 bg-gradient-to-br from-emerald-500/8 to-transparent hover:from-emerald-500/12" : "border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-transparent hover:from-violet-500/12"}`}
      onClick={() => setExpanded(!expanded)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${primary ? "bg-emerald-500/15 text-emerald-400" : "bg-violet-500/15 text-violet-400"}`}><Code2 size={14} /></div>
          <div>
            <div className="font-semibold text-ink text-sm">@{account.handle}</div>
            <div className="text-[10px] font-mono text-muted/50">{primary ? "Primary" : "Legacy"}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a href={account.href} target="_blank" rel="noreferrer" className="text-muted/40 hover:text-accent transition" onClick={(e) => e.stopPropagation()}><ExternalLink size={14} /></a>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={14} className="text-muted/40" /></motion.div>
        </div>
      </div>
      <div className="grid gap-2">{stats.map((s) => (<StatBar key={s.label} {...s} />))}</div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
            <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
              <div className="flex flex-wrap gap-1">
                {account.tags.map((t) => (
                  <span key={t} className={`rounded-full border px-2 py-0.5 text-[9px] font-mono ${primary ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-400/80" : "border-violet-500/20 bg-violet-500/8 text-violet-400/80"}`}>{t}</span>
                ))}
              </div>
              {accountRepos.length > 0 && (
                <div>
                  <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted/40 mb-1">Signal profile vs avg</div>
                  <AccountSignalChart signals1={accountRepos} signals2={repoSignals} label1={`@${account.handle}`} label2="All repos" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CircularStat({ value, label, icon, color, index }: { value: string | number; label: string; icon: React.ReactNode; color: string; index: number }) {
  return (
    <motion.div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 flex items-center gap-3 cursor-default hover:border-white/[0.15] hover:bg-white/[0.06] transition-all group"
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: index * 0.08, duration: 0.35 }} whileHover={{ scale: 1.02 }}>
      <motion.div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }} whileHover={{ scale: 1.1, background: `${color}30` }}>
        <span style={{ color }}>{icon}</span>
      </motion.div>
      <div>
        <motion.div className="text-lg font-bold text-ink" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.15 + index * 0.08 }}>{value}</motion.div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted/50">{label}</div>
      </div>
    </motion.div>
  );
}

function getRepositoryActions(id: string, repoUrl?: string, demoUrl?: string) {
  const featuredMatch = featuredSystems.find((system) => system.id === id);
  if (featuredMatch?.links.length) return featuredMatch.links;
  const fallback: { label: string; href: string; variant: "primary" | "secondary" }[] = [];
  if (repoUrl) fallback.push({ label: "Repository", href: repoUrl, variant: "primary" });
  if (demoUrl) fallback.push({ label: "Live Demo", href: demoUrl, variant: "secondary" });
  return fallback;
}

const coralPRs = [
  { name: "Cloudinary", pr: "1242", status: "open", description: "feat(sources/community): add Cloudinary media management source" },
  { name: "Blogger", pr: "1223", status: "open", description: "feat(sources/community/blogger): add Blogger community source" },
  { name: "Stream Video", pr: "1230", status: "open", description: "feat(sources/community): add Stream Video communication source" },
  { name: "Razorpay", pr: "1232", status: "open", description: "feat(sources/community/razorpay): add Razorpay payment source" },
  { name: "ElevenLabs", pr: "1175", status: "open", description: "feat(sources/community/elevenlabs): add TTS/voice cloning source" },
  { name: "PayPal", pr: "1173", status: "open", description: "feat(sources/community/paypal): add PayPal payment source" },
  { name: "NVIDIA NIM", pr: "958", status: "open", description: "feat(sources/community/nvidia_nim): add accelerated inference source" },
  { name: "Tavily", pr: "1204", status: "merged", description: "feat(sources/community/tavily): add web search API source" },
  { name: "Deepgram ASR", pr: "1118", status: "merged", description: "feat(sources/community/deepgram): add speech-to-text source" },
  { name: "Voyage AI", pr: "1115", status: "merged", description: "feat(sources/community/voyage_ai): add embeddings API source" },
  { name: "Sarvam AI", pr: "1112", status: "merged", description: "feat(sources/community/sarvam_ai): add Indian language AI source" },
  { name: "Cohere AI", pr: "1098", status: "merged", description: "feat(sources/community/cohere_ai): add rerank/embedding source" },
  { name: "Mistral AI", pr: "1011", status: "merged", description: "feat(sources/community/mistral_ai): add LLM source" },
  { name: "OpenRouter (docs)", pr: "950", status: "merged", description: "docs(sources/community/openrouter): update provider docs" },
  { name: "OpenRouter", pr: "882", status: "merged", description: "feat(sources/community/openrouter): add unified LLM router source" },
  { name: "LM Studio", pr: "834", status: "merged", description: "feat(sources/community/lm_studio): add local model serving source" },
  { name: "Ollama", pr: "798", status: "merged", description: "feat(sources/community/ollama): add local LLM runtime source" },
  { name: "Groq AI", pr: "754", status: "merged", description: "feat(sources/community/groq_ai): add ultra-fast inference source" },
  { name: "Cloudinary (iter)", pr: "1240", status: "closed", description: "feat(sources/community/cloudinary): closed without merge" },
];

type SortKey = "score" | "name";

export function GitHubIntelligenceSection() {
  const themes = useMemo(() => ["All", ...getRepositoryThemes()], []);
  const [activeTheme, setActiveTheme] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [prFilter, setPrFilter] = useState<"all" | "merged" | "open" | "closed">("all");
  const [chartSelectedId, setChartSelectedId] = useState<string | null>(null);
  const repoListRef = useRef<HTMLDivElement>(null);

  const topRepository = useMemo(() => getTopRepository(), []);
  const topRepositoryActions = useMemo(() => (topRepository ? getRepositoryActions(topRepository.id, topRepository.repoUrl, topRepository.demoUrl) : []), [topRepository]);

  const rawRepositories = useMemo(() => getRankedRepositories(activeTheme === "All" ? undefined : activeTheme), [activeTheme]);

  const repositories = useMemo(() => {
    let list = rawRepositories;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.synopsis.toLowerCase().includes(q) || r.themes.some(t => t.toLowerCase().includes(q)));
    }
    return [...list].sort((a, b) => {
      const mul = sortDir === "desc" ? -1 : 1;
      if (sortBy === "name") return mul * a.title.localeCompare(b.title);
      return mul * (a.score - b.score);
    });
  }, [rawRepositories, searchQuery, sortBy, sortDir]);

  const allMergedCount = coralPRs.filter((p) => p.status === "merged").length;
  const allOpenCount = coralPRs.filter((p) => p.status === "open").length;
  const allClosedCount = coralPRs.filter((p) => p.status === "closed").length;
  const filteredPRs = prFilter === "all" ? coralPRs : coralPRs.filter(p => p.status === prFilter);

  return (
    <section id="github" className="section-space">
      <div className="section-frame">
        <div className="rounded-xl border border-orange-500/50 bg-black/10 p-5 sm:rounded-2xl sm:border-2 sm:p-6 lg:rounded-3xl lg:p-10">
          <SectionHeading
            eyebrow="GitHub Profile"
            title="Open source that ships."
            description={<><span className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">19 PRs (11 merged) to Coral MCP</span><span className="rounded-full border border-blue-500/20 bg-blue-500/8 px-2.5 py-0.5 text-[11px] font-mono text-blue-400">120 public repos across two accounts</span><span className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2.5 py-0.5 text-[11px] font-mono text-amber-400">706 total commits</span></>}
          />

          <motion.div className="grid gap-2 sm:grid-cols-4 mb-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.3 }}>
            <CircularStat value="19" label="Coral PRs" icon={<GitPullRequest size={16} />} color="#10b981" index={0} />
            <CircularStat value="706" label="Total Commits" icon={<GitCommitHorizontal size={16} />} color="#3b82f6" index={1} />
            <CircularStat value="120" label="Total Repos" icon={<BookOpen size={16} />} color="#f59e0b" index={2} />
            <CircularStat value="39" label="APK Downloads" icon={<Users size={16} />} color="#8b5cf6" index={3} />
          </motion.div>

          <div className="grid gap-3 xl:grid-cols-[1fr 1.2fr]">
            <motion.div className="grid gap-3 self-start" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4 }}>
              {topRepository ? (
                <motion.div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4" whileHover={{ scale: 1.005 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-emerald-400" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">Strongest signal</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xl font-semibold text-ink">{topRepository.title}</div>
                      <p className="mt-1 text-sm text-muted/80">{topRepository.overview}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/12 px-2.5 py-1 text-[10px] font-mono text-emerald-400">@{topRepository.account}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {topRepository.bestFor.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted/70">{tag}</span>
                      ))}
                    </div>
                    <SignalProfileChart signals={topRepository} size="sm" />
                  </div>
                  {topRepositoryActions.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      <Button href={getSystemRouteHref(topRepository.id)} size="sm" className="bg-emerald-600/80 hover:bg-emerald-600 border-0 text-white text-[10px] px-3 py-1.5 h-auto">Case Study</Button>
                      {topRepositoryActions.slice(0, 2).map((link) => (
                        <Button key={link.label} href={link.href ?? "#"} variant="secondary" size="sm" className="text-[10px] px-3 py-1.5 h-auto">{compactActionLabel(link.label)}</Button>
                      ))}
                    </div>
                  )}
                  <GitHubCommitSurface repoUrl={topRepository.repoUrl} title={topRepository.title} fallbackEntries={topRepository.highlights ?? [topRepository.overview, topRepository.whyItMatters]} className="mt-3" compact />
                </motion.div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                {githubAccounts.slice(0, 2).map((account, i) => (
                  <motion.div key={account.handle} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: i * 0.1, duration: 0.35 }}>
                    <AccountStatCard account={account} primary={account.status === "primary"} repoSignals={repositorySignals} />
                  </motion.div>
                ))}
              </div>

              <motion.div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: 0.15, duration: 0.35 }}>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/70 mb-3 flex items-center gap-2">
                  <Zap size={12} className="text-amber-400/60" />
                  Achievements
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    {
                      name: "Pull Shark x3", desc: "@FiscalMindset opened pull requests that have been merged",
                      img: "https://github.githubassets.com/assets/pull-shark-default-498c279a747d.png"
                    },
                    {
                      name: "YOLO", desc: "Merged PRs without review",
                      img: "https://github.githubassets.com/assets/yolo-default-be0bbff04951.png"
                    },
                    {
                      name: "Quickdraw", desc: "PRs merged within 5 minutes",
                      img: "https://github.githubassets.com/assets/quickdraw-default-39c6aec8ff89.png"
                    },
                  ].map((a, i) => (
                    <motion.div key={a.name} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 hover:border-amber-500/20 hover:bg-amber-500/5 transition cursor-default" initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08 }} whileHover={{ scale: 1.03 }}>
                      <img src={a.img} alt="" aria-hidden="true" className="h-8 w-8" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-ink">{a.name}</div>
                        <div className="text-[9px] text-muted/50">{a.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div className="grid gap-3" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: 0.1 }}>
              {/* Coral MCP Analysis */}
              <CoralMCPAnalysis prs={coralPRs} />

              {/* Coral MCP PR list */}
              <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400"><GitPullRequest size={11} /></div>
                    <div className="font-semibold text-ink text-xs">All PRs</div>
                  </div>
                  <div className="flex gap-1">
                    <span className="rounded-full bg-emerald-500/12 border border-emerald-500/25 px-2 py-0.5 text-[9px] font-mono text-emerald-400">{allMergedCount} merged</span>
                    <span className="rounded-full bg-amber-500/12 border border-amber-500/25 px-2 py-0.5 text-[9px] font-mono text-amber-400">{allOpenCount} open</span>
                    {allClosedCount > 0 && <span className="rounded-full bg-gray-500/12 border border-gray-500/25 px-2 py-0.5 text-[9px] font-mono text-gray-400">{allClosedCount} closed</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 mb-2">
                  {(["all", "merged", "open", "closed"] as const).map((f) => (
                    <button key={f}
                      className={`rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] transition ${
                        prFilter === f
                          ? f === "merged" ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-400"
                            : f === "open" ? "border-amber-500/40 bg-amber-500/12 text-amber-400"
                            : f === "closed" ? "border-gray-500/40 bg-gray-500/12 text-gray-400"
                            : "border-emerald-500/40 bg-emerald-500/12 text-emerald-400"
                          : "border-white/[0.08] text-muted/50 hover:text-ink"
                      }`}
                      onClick={() => setPrFilter(f)}
                    >
                      {f === "all" ? `All (${coralPRs.length})` : f === "merged" ? `Merged (${allMergedCount})` : f === "open" ? `Open (${allOpenCount})` : `Closed (${allClosedCount})`}
                    </button>
                  ))}
                </div>
                <div className="grid gap-1 sm:grid-cols-2">
                  {filteredPRs.map((pr, i) => (
                    <motion.a key={pr.name + pr.pr} href={`https://github.com/withcoral/coral/pull/${pr.pr}`} target="_blank" rel="noreferrer"
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition group"
                      initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20px" }}
                      transition={{ delay: i * 0.02, duration: 0.2 }} whileHover={{ x: 2 }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${pr.status === "merged" ? "bg-emerald-400" : pr.status === "open" ? "bg-amber-400" : "bg-gray-400"}`} />
                        <div className="min-w-0">
                          <span className="text-[11px] text-ink group-hover:text-emerald-400 transition truncate block">{pr.name}</span>
                          <span className="text-[7px] text-muted/40 truncate block">{pr.description}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[9px] text-muted/50 shrink-0 ml-1">#{pr.pr}</span>
                    </motion.a>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[9px] text-emerald-400/80">✓ CLA Signed</span>
                  <a href="https://github.com/withcoral/coral/pulls?q=author%3AFiscalMindset" target="_blank" rel="noreferrer" className="text-emerald-400/70 hover:text-emerald-300 text-[9px] font-mono transition flex items-center gap-1">
                    View all <ArrowUpRight size={9} />
                  </a>
                  <span className="text-[7px] font-mono text-muted/30 ml-auto">{filteredPRs.length} of {coralPRs.length}</span>
                </div>
              </div>

              {/* Featured projects */}
              <motion.div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ delay: 0.05, duration: 0.35 }}>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent/70 mb-3">Featured projects</div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {[
                    { name: "Algsoch", desc: "Android AI news app", lang: "Kotlin", color: "#7c3aed", stars: 6 },
                    { name: "Algsoch News", desc: "Multi-agent AI newsroom", lang: "Python", color: "#f59e0b", stars: 4 },
                    { name: "CareOps", desc: "Healthcare coordination agent", lang: "TypeScript", color: "#3b82f6", stars: 3 },
                    { name: "CommandBrain", desc: "AI command assistant", lang: "Python", color: "#10b981", stars: 8 },
                    { name: "Synapse-Graph", desc: "AI autopsy engine", lang: "Python", color: "#ec4899", stars: 5 },
                    { name: "Kairon", desc: "AI automation platform", lang: "Python", color: "#f97316", stars: 4 },
                  ].map((p, i) => (
                    <motion.div key={p.name} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 hover:border-accent/20 hover:bg-accent/5 transition group cursor-default"
                      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20px" }}
                      transition={{ delay: i * 0.04, duration: 0.25 }} whileHover={{ scale: 1.02, y: -1 }}>
                      <motion.div className="h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: `${p.color}20`, color: p.color }}
                        whileHover={{ scale: 1.15, background: `${p.color}35` }}>{p.name[0]}</motion.div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-ink group-hover:text-accent transition truncate">{p.name}</div>
                        <div className="text-[10px] text-muted/60 truncate">{p.desc}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] font-mono" style={{ color: p.color }}>● {p.lang}</span>
                          <span className="flex items-center gap-0.5 text-[8px] text-muted/40"><Star size={8} />{p.stars}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Ranked repositories */}
          <motion.div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, delay: 0.1 }}>
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex flex-wrap items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent/70 flex flex-wrap items-center gap-2">
                      <span>Curated ranking</span>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[8px] font-mono text-muted/50">{repositories.length} repo{repositories.length !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="inline-block mt-1 rounded-full border border-accent/15 bg-accent/8 px-2 py-0.5 text-[9px] font-mono text-accent/70">Click a bar or repo row to expand details</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="relative">
                      <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted/40" />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..."
                        className="w-28 sm:w-36 rounded-full border border-white/[0.08] bg-white/[0.03] pl-7 pr-2.5 py-1.5 text-[10px] text-ink outline-none placeholder:text-muted/30 focus:border-accent/30 focus:bg-white/[0.06] transition" />
                    </div>
                    <div className="flex items-center gap-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-1 py-0.5">
                      <button className={`px-2 py-0.5 rounded-full text-[9px] font-mono transition ${sortBy === "score" ? "bg-accent/15 text-accent" : "text-muted/50 hover:text-ink"}`}
                        onClick={() => { if (sortBy === "score") setSortDir(sortDir === "desc" ? "asc" : "desc"); else { setSortBy("score"); setSortDir("desc"); } }}>
                        Score {sortBy === "score" ? (sortDir === "desc" ? "↓" : "↑") : ""}
                      </button>
                      <button className={`px-2 py-0.5 rounded-full text-[9px] font-mono transition ${sortBy === "name" ? "bg-accent/15 text-accent" : "text-muted/50 hover:text-ink"}`}
                        onClick={() => { if (sortBy === "name") setSortDir(sortDir === "desc" ? "asc" : "desc"); else { setSortBy("name"); setSortDir("asc"); } }}>
                        Name {sortBy === "name" ? (sortDir === "asc" ? "A-Z" : "Z-A") : ""}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {themes.map((theme) => (
                    <button key={theme} className={`rounded-full border whitespace-nowrap px-2.5 py-1 text-[9px] font-mono shrink-0 transition ${theme === activeTheme ? "border-accent/50 bg-accent/15 text-ink" : "border-white/[0.1] text-muted/50 hover:text-ink hover:border-white/[0.2]"}`}
                      onClick={() => setActiveTheme(theme)}>{theme}</button>
                  ))}
                </div>
              </div>

            {repositories.length > 0 && (
              <InteractiveScoreChart repos={repositories.map(r => ({ id: r.id, title: r.title, score: r.score, account: r.account }))}
                selectedId={chartSelectedId}
                onSelect={(id) => { setChartSelectedId(id); setExpandedRepo(id); setSearchQuery(""); repoListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
            )}

            <div ref={repoListRef} className="mt-3 grid gap-2">
              <AnimatePresence mode="popLayout">
                {repositories.length === 0 ? (
                  <motion.div key="empty" className="text-center py-8 text-muted/40 text-sm font-mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    No repos match "{searchQuery}"
                  </motion.div>
                ) : repositories.map((repo, index) => {
                  const repoActions = getRepositoryActions(repo.id, repo.repoUrl, repo.demoUrl);
                  const scoreColor = repo.score > 0.8 ? "#10b981" : repo.score > 0.6 ? "#f59e0b" : "#6366f1";
                  const isExpanded = expandedRepo === repo.id;
                  return (
                    <motion.div key={repo.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.02 }}
                      className={`rounded-xl border transition-all cursor-pointer ${isExpanded ? "border-accent/25 bg-white/[0.04]" : "border-white/[0.06] bg-white/[0.02] hover:border-accent/15"} ${chartSelectedId === repo.id ? "ring-1 ring-accent/20" : ""}`}
                      onClick={() => { setExpandedRepo(isExpanded ? null : repo.id); setChartSelectedId(repo.id); }}>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] text-muted/40">#{index + 1}</span>
                              <span className="text-sm font-semibold text-ink">{repo.title}</span>
                              <span className="font-mono text-[8px] text-muted/30">@{repo.account}</span>
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={12} className="text-muted/30" /></motion.div>
                            </div>
                            <p className="text-xs text-muted/70 mt-0.5 line-clamp-1">{repo.synopsis}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono" style={{ color: scoreColor }}>{(repo.score * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                        <div className="mt-2 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div className="h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${repo.score * 100}%` }} viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: "easeOut" }} style={{ background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}66)` }} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {repo.themes.slice(0, 2).map((t) => (<span key={t} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[8px] text-muted/50">{t}</span>))}
                          {repo.bestFor.slice(0, 2).map((t) => (<span key={t} className="rounded-full border border-accent/15 bg-accent/8 px-1.5 py-0.5 text-[8px] text-accent/70">{t}</span>))}
                        </div>
                      </div>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
                            <div className="border-t border-white/[0.06] px-3 pb-3 pt-2">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted/40">Signal profile</div>
                                <SignalProfileChart signals={repo} size="sm" />
                              </div>
                              {repo.highlights && repo.highlights.length > 0 && (
                                <div className="mb-2">
                                  <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted/40 mb-1">Highlights</div>
                                  <ul className="space-y-0.5">{repo.highlights.slice(0, 3).map((h, i) => (<li key={i} className="flex items-start gap-1.5 text-[10px] text-muted/70"><span className="text-emerald-400/60 mt-0.5 shrink-0">◆</span>{h}</li>))}</ul>
                                </div>
                              )}
                              {repo.whyItMatters && (
                                <div className="mb-2">
                                  <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-muted/40 mb-1">Why it matters</div>
                                  <p className="text-[10px] text-muted/70 leading-relaxed">{repo.whyItMatters}</p>
                                </div>
                              )}
                              {repoActions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/[0.04]">
                                  {featuredSystems.some((s) => s.id === repo.id) && (
                                    <a href={getSystemRouteHref(repo.id)} className="rounded-full border border-accent/20 bg-accent/8 px-2.5 py-1 text-[9px] font-mono text-accent/70 hover:text-accent transition" onClick={(e) => e.stopPropagation()}>Case Study →</a>
                                  )}
                                  {repoActions.map((link) => (
                                    <a key={link.label} href={link.href ?? "#"} target="_blank" rel="noreferrer" className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[9px] font-mono text-muted/50 hover:text-muted/80 transition" onClick={(e) => e.stopPropagation()}>{compactActionLabel(link.label)} ↗</a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          <FiscalMindsetBadge />
        </div>
      </div>
    </section>
  );
}
