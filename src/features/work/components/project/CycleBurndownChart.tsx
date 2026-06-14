import React, { useMemo, useState } from 'react';

interface BurndownPoint {
  date: string;
  label: string;
  ideal: number;
  actual: number;
}

interface Props {
  startDate: string;
  endDate: string;
  totalItems: number;
  doneCount: number;
  today?: string;
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000));
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildPoints(startDate: string, endDate: string, totalItems: number, doneCount: number, today: string): BurndownPoint[] {
  const totalDays = daysBetween(startDate, endDate);
  const remaining = totalItems - doneCount;
  const todayIdx = Math.min(
    Math.max(0, daysBetween(startDate, today)),
    totalDays
  );

  const points: BurndownPoint[] = [];
  for (let i = 0; i <= totalDays; i++) {
    const date = addDays(startDate, i);
    const ideal = Math.max(0, Math.round(totalItems * (1 - i / totalDays) * 10) / 10);
    let actual = totalItems;
    if (i <= todayIdx) {
      const progress = todayIdx > 0 ? i / todayIdx : 0;
      actual = Math.round((totalItems - doneCount * progress) * 10) / 10;
      if (i === todayIdx) actual = remaining;
    }
    points.push({
      date,
      label: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      ideal,
      actual: i <= todayIdx ? actual : remaining,
    });
  }
  return points;
}

function toPath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

export const CycleBurndownChart: React.FC<Props> = ({
  startDate,
  endDate,
  totalItems,
  doneCount,
  today = '2026-06-14',
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const points = useMemo(
    () => buildPoints(startDate, endDate, totalItems, doneCount, today),
    [startDate, endDate, totalItems, doneCount, today]
  );

  const width = 480;
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 32, left: 36 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxY = Math.max(totalItems, 1);

  const coords = points.map((p, i) => ({
    x: pad.left + (i / Math.max(points.length - 1, 1)) * chartW,
    yIdeal: pad.top + chartH - (p.ideal / maxY) * chartH,
    yActual: pad.top + chartH - (p.actual / maxY) * chartH,
    point: p,
  }));

  const idealPath = toPath(coords.map(c => ({ x: c.x, y: c.yIdeal })));
  const actualPath = toPath(coords.map(c => ({ x: c.x, y: c.yActual })));

  const todayIdx = points.findIndex(p => p.date === today);
  const todayX = todayIdx >= 0 ? coords[todayIdx]?.x : null;

  const yTicks = Array.from({ length: maxY + 1 }, (_, i) => maxY - i);

  return (
    <div className="work-cycle-burndown">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="work-cycle-burndown__svg"
        role="img"
        aria-label="Burndown chart for work items"
      >
        {yTicks.map(val => {
          const y = pad.top + chartH - (val / maxY) * chartH;
          return (
            <g key={val}>
              <line
                x1={pad.left}
                y1={y}
                x2={width - pad.right}
                y2={y}
                className="work-cycle-burndown__grid-line"
              />
              <text x={pad.left - 8} y={y + 4} className="work-cycle-burndown__axis-label" textAnchor="end">
                {val}
              </text>
            </g>
          );
        })}

        <path d={idealPath} className="work-cycle-burndown__line work-cycle-burndown__line--ideal" fill="none" />
        <path d={actualPath} className="work-cycle-burndown__line work-cycle-burndown__line--actual" fill="none" />

        {todayX != null && (
          <line
            x1={todayX}
            y1={pad.top}
            x2={todayX}
            y2={pad.top + chartH}
            className="work-cycle-burndown__today"
          />
        )}

        {coords.map((c, i) => (
          <g key={c.point.date}>
            <circle
              cx={c.x}
              cy={c.yActual}
              r={hoverIdx === i ? 5 : 3}
              className="work-cycle-burndown__dot"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
            {i % Math.ceil(points.length / 5) === 0 || i === points.length - 1 ? (
              <text x={c.x} y={height - 8} className="work-cycle-burndown__axis-label" textAnchor="middle">
                {c.point.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>

      {hoverIdx != null && coords[hoverIdx] && (
        <div
          className="work-cycle-burndown__tooltip"
          style={{ left: `${(coords[hoverIdx].x / width) * 100}%` }}
        >
          <span className="work-cycle-burndown__tooltip-date">{coords[hoverIdx].point.label}</span>
          <span>Ideal: {coords[hoverIdx].point.ideal}</span>
          <span>Actual: {coords[hoverIdx].point.actual}</span>
        </div>
      )}

      <div className="work-cycle-burndown__legend">
        <span className="work-cycle-burndown__legend-item">
          <span className="work-cycle-burndown__legend-swatch work-cycle-burndown__legend-swatch--ideal" />
          Ideal
        </span>
        <span className="work-cycle-burndown__legend-item">
          <span className="work-cycle-burndown__legend-swatch work-cycle-burndown__legend-swatch--actual" />
          Actual
        </span>
        {todayX != null && (
          <span className="work-cycle-burndown__legend-item">
            <span className="work-cycle-burndown__legend-swatch work-cycle-burndown__legend-swatch--today" />
            Today
          </span>
        )}
      </div>
    </div>
  );
};
