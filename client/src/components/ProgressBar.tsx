import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const rawPct = total > 0 ? Math.round((current / total) * 100) : 0;
  const pct = Math.min(100, Math.max(0, rawPct));
  return (
    <div className="progress-bar">
      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      <span className="progress-bar-text">{pct}%</span>
    </div>
  );
}