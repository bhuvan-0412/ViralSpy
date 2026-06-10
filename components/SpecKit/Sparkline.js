import React from 'react';

export default function Sparkline({ data = [], status = 'PEAKED' }) {
  if (!data || data.length === 0) return null;

  const width = 120;
  const height = 40;
  const padding = 2;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const points = data.map((val, index) => {
    const x = padding + (index * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - ((val - minVal) * (height - padding * 2)) / range;
    return { x, y };
  });

  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 3;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (2 * (next.x - curr.x)) / 3;
      const cpY2 = next.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
  }

  const fillD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
    : '';

  let strokeColor = 'rgba(244, 242, 237, 0.25)'; 
  let gradientId = 'grad-peaked-spec';
  let stopColor1 = 'rgba(244, 242, 237, 0.05)';
  let stopColor2 = 'rgba(244, 242, 237, 0.0)';

  if (status === 'EXPLODING') {
    strokeColor = '#ef4444'; 
    gradientId = 'grad-exploding-spec';
    stopColor1 = 'rgba(239, 68, 68, 0.2)';
    stopColor2 = 'rgba(239, 68, 68, 0.0)';
  } else if (status === 'RISING') {
    strokeColor = '#F4F2ED'; 
    gradientId = 'grad-rising-spec';
    stopColor1 = 'rgba(244, 242, 237, 0.1)';
    stopColor2 = 'rgba(244, 242, 237, 0.0)';
  }

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stopColor1} />
          <stop offset="100%" stopColor={stopColor2} />
        </linearGradient>
      </defs>
      {fillD && <path d={fillD} fill={`url(#${gradientId})`} />}
      {pathD && (
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
