import type { SelectedItem } from './SelectedItem';
import { edgeColor, edgeStatusLabel, statusFill, statusLabel } from './statusColors';

interface HoverTooltipProps {
  item: SelectedItem | null;
  position: { x: number; y: number } | null;
}

export default function HoverTooltip({ item, position }: HoverTooltipProps) {
  if (!item || !position) return null;

  const label = item.type === 'node' ? item.data.label : `${item.data.sourceLabel ?? ''} → ${item.data.targetLabel ?? ''}`;
  const dotColor = item.type === 'node' ? statusFill(item.data.status) : edgeColor(item.data.status);
  const statusText = item.type === 'node' ? statusLabel(item.data.status) : edgeStatusLabel(item.data.status);
  const preview = item.type === 'edge' ? truncate(item.data.annotation, 90) : null;

  return (
    <div
      className="hover-tooltip"
      style={{ left: position.x + 16, top: position.y + 16 }}
    >
      <div className="hover-tooltip__row">
        <span className="hover-tooltip__dot" style={{ background: dotColor }} />
        <span className="hover-tooltip__label">{label}</span>
      </div>
      <p className="hover-tooltip__status">{statusText}</p>
      {preview && <p className="hover-tooltip__preview">{preview}</p>}
      <p className="hover-tooltip__cta">Click for details</p>
    </div>
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
