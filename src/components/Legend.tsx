export default function Legend() {
  return (
    <div className="legend" role="note" aria-label="Diagram legend">
      <div className="legend__group">
        <p className="legend__heading">Node status (pipeline maturity)</p>
        <LegendSwatch color="var(--status-green)" label="Fully built & usable" />
        <LegendSwatch color="var(--status-amber)" label="Actively being worked on" />
        <LegendSwatch color="var(--status-red)" label="Pipeline doesn't exist" />
      </div>

      <div className="legend__group">
        <p className="legend__heading">Connection status</p>
        <LegendLine color="var(--status-green)" dashed={false} label="Automated & connected" />
        <LegendLine color="var(--status-red)" dashed={true} label="Not automated / absent" />
      </div>

      <div className="legend__group">
        <p className="legend__heading">Data domain</p>
        <LegendOutlineSwatch color="var(--level-1-line)" label="Level 1" />
        <LegendOutlineSwatch color="var(--level-2-line)" label="Level 2" />
      </div>

      <div className="legend__group">
        <p className="legend__heading">Tributary source</p>
        <div className="legend__row">
          <span className="legend__icon" aria-hidden="true">⚙</span>
          <span>Internal source</span>
        </div>
        <div className="legend__row">
          <span className="legend__icon" aria-hidden="true">⛟</span>
          <span>External / partner source</span>
        </div>
      </div>

      <p className="legend__hint">Click any node or connection for details. Hover for a quick preview.</p>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="legend__row">
      <span className="legend__swatch" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function LegendOutlineSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="legend__row">
      <span className="legend__swatch" style={{ background: 'var(--surface)', border: `3px solid ${color}` }} />
      <span>{label}</span>
    </div>
  );
}

function LegendLine({ color, dashed, label }: { color: string; dashed: boolean; label: string }) {
  return (
    <div className="legend__row">
      <svg width="24" height="10" aria-hidden="true">
        <line
          x1="0"
          y1="5"
          x2="24"
          y2="5"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={dashed ? '5 4' : undefined}
          strokeLinecap="round"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}
