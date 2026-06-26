'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GitHubCalendar } from 'react-github-calendar';

const GITHUB_USERNAME = 'vishal-jadeja';
const LEETCODE_USERNAME = 'vishaljadeja';

interface LeetCodeStats {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  calendar: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Heatmap helpers
// ---------------------------------------------------------------------------

function getCellColor(count: number, isDark: boolean): string {
  if (isDark) {
    if (count === 0) return '#ffffff08';
    if (count === 1) return '#FFE60025';
    if (count <= 3) return '#FFE60055';
    if (count <= 6) return '#FFE60099';
    return '#FFE600';
  } else {
    if (count === 0) return '#f1f5f9';
    if (count === 1) return '#fef08a';
    if (count <= 3) return '#fde047';
    if (count <= 6) return '#facc15';
    return '#eab308';
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Build a 7×52 grid (rows = day-of-week Sun–Sat, cols = weeks) for the last 364 days */
function buildHeatmapGrid(calendar: Record<string, number>) {
  const today = new Date();

  // Work in UTC so our timestamps match LeetCode's key format exactly.
  // Start from the most recent Sunday (UTC) and go back 52 weeks.
  const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const dayOfWeekUTC = new Date(todayUTC).getUTCDay(); // 0=Sun … 6=Sat
  // Rewind to the Saturday that ends the current week
  const endOfGridUTC = todayUTC + (6 - dayOfWeekUTC) * 86400_000;

  const cells: { date: Date; count: number }[][] = Array.from({ length: 7 }, () => []);

  for (let week = 51; week >= 0; week--) {
    for (let dow = 0; dow < 7; dow++) {
      const daysBack = week * 7 + (6 - dow);
      const cellUTC = endOfGridUTC - daysBack * 86400_000;

      // LeetCode key = seconds since Unix epoch at UTC midnight
      const ts = Math.floor(cellUTC / 1000).toString();
      const count = calendar[ts] ?? 0;

      cells[dow].push({ date: new Date(cellUTC), count });
    }
  }

  return cells; // cells[dow][weekIndex]
}


function LeetCodeHeatmap({ calendar }: { calendar: Record<string, number> }) {
  const grid = buildHeatmapGrid(calendar);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-muted text-xs font-mono">Submission activity · last 52 weeks</p>
      <div className="overflow-x-auto pb-1">
        <div
          style={{
            display: 'grid',
            gridTemplateRows: 'repeat(7, 11px)',
            gridTemplateColumns: 'repeat(52, 11px)',
            gap: '3px',
          }}
        >
          {grid.map((row, dow) =>
            row.map((cell, wi) => (
              <div
                key={`${dow}-${wi}`}
                title={`${formatDate(cell.date)}: ${cell.count} submission${cell.count !== 1 ? 's' : ''}`}
                style={{
                  gridRow: dow + 1,
                  gridColumn: wi + 1,
                  width: '11px',
                  height: '11px',
                  borderRadius: '2px',
                  backgroundColor: getCellColor(cell.count, isDark),
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`,
                  cursor: cell.count > 0 ? 'default' : undefined,
                  transition: 'opacity 0.15s',
                }}
              />
            ))
          )}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 text-text-muted text-xs font-mono mt-0.5">
        <span>Less</span>
        {[0, 1, 3, 6].map((n, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: getCellColor(n, isDark),
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              flexShrink: 0,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LeetCodeView
// ---------------------------------------------------------------------------

function LeetCodeView() {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/leetcode?username=${LEETCODE_USERNAME}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: LeetCodeStats) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg shimmer" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-8 text-center text-text-muted text-sm font-mono">
        Could not load LeetCode stats — visit{' '}
        <a
          href={`https://leetcode.com/${LEETCODE_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-main underline underline-offset-2"
        >
          leetcode.com/{LEETCODE_USERNAME}
        </a>
      </div>
    );
  }

  const total = stats.easy + stats.medium + stats.hard;
  const easyPct = total ? Math.round((stats.easy / total) * 100) : 0;
  const medPct = total ? Math.round((stats.medium / total) * 100) : 0;
  const hardPct = total ? Math.round((stats.hard / total) * 100) : 0;

  return (
    <div className="py-4 flex flex-col gap-6">
      {/* Big number */}
      <div className="flex items-baseline gap-3">
        <span
          className="font-bold text-text-main"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1 }}
        >
          {stats.solved}
        </span>
        <span className="text-text-muted text-base font-medium">problems solved</span>
      </div>

      {/* Difficulty breakdown */}
      <div className="flex flex-col gap-3">
        {[
          { label: 'Easy', count: stats.easy, pct: easyPct, color: 'bg-emerald-500' },
          { label: 'Medium', count: stats.medium, pct: medPct, color: 'bg-amber-400' },
          { label: 'Hard', count: stats.hard, pct: hardPct, color: 'bg-red-500' },
        ].map(({ label, count, pct, color }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-text-muted text-xs font-medium">{label}</span>
              <span className="font-mono text-text-main text-xs">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--theme-border-main)] overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${color}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Submission heatmap */}
      <LeetCodeHeatmap calendar={stats.calendar} />

      {/* Footer link */}
      <div className="flex items-center gap-2 text-text-muted text-xs font-mono pt-1">
        <a
          href={`https://leetcode.com/${LEETCODE_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-main underline underline-offset-2 hover:opacity-75 transition-opacity"
        >
          leetcode.com/{LEETCODE_USERNAME}
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GitHubContributions (main export)
// ---------------------------------------------------------------------------

export default function GitHubContributions() {
  const [tab, setTab] = useState<'github' | 'leetcode'>('leetcode');
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const darkTheme = {
    light: ['#f1f5f9', '#d1fae5', '#6ee7b7', '#10b981', '#059669'],
    dark: ['#1a1a1a', '#033a16', '#196c2e', '#2ea043', '#56d364'],
  };

  useEffect(() => {
    if (mounted && tab === 'github' && calendarScrollRef.current) {
      calendarScrollRef.current.scrollLeft = calendarScrollRef.current.scrollWidth;
    }
  }, [mounted, tab]);

  return (
    <section id="contributions" className="py-8 px-5 sm:px-8 bg-bg">
      <div className="max-w-[840px] mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10 flex-wrap gap-4"
        >
          <h2 className="font-bold text-text-main text-2xl">Contributions</h2>

          {/* Tab toggle */}
          <div className="flex items-center bg-[var(--theme-card)] rounded-lg p-1 gap-1 border border-border-subtle">
            {(['github', 'leetcode'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-widest uppercase transition-all duration-200 ${tab === t
                  ? 'bg-[var(--theme-text-main)] text-[var(--theme-bg)]'
                  : 'text-text-muted hover:text-text-main'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {tab === 'github' ? (
            <div className="flex flex-col gap-6">
              <div
                ref={calendarScrollRef}
                className="overflow-x-auto"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--theme-border-main) transparent',
                }}
              >
                {mounted ? (
                  <GitHubCalendar
                    username={GITHUB_USERNAME}
                    colorScheme={isDark ? 'dark' : 'light'}
                    theme={darkTheme}
                    fontSize={12}
                    blockSize={12}
                    blockMargin={4}
                    blockRadius={3}
                    labels={{
                      legend: { less: 'Less', more: 'More' },
                      totalCount: '{{count}} contributions in {{year}}',
                    }}
                    style={{
                      color: 'var(--theme-text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                ) : (
                  <div className="h-[112px] rounded-lg shimmer" />
                )}
              </div>
              <div className="flex items-center gap-2 text-text-muted text-xs font-mono">
                <a
                  href={`https://github.com/${GITHUB_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-main underline underline-offset-2 hover:opacity-75 transition-opacity"
                >
                  github.com/{GITHUB_USERNAME}
                </a>
                <span>·</span>
                <span>All repositories included</span>
              </div>
            </div>
          ) : (
            <LeetCodeView />
          )}
        </motion.div>
      </div>
    </section>
  );
}
