import type { SelectedItem } from './SelectedItem';
import { edgeColor, edgeStatusLabel, statusFill, statusInk, statusLabel } from './statusColors';

interface DetailPanelProps {
  item: SelectedItem | null;
  onClose: () => void;
}

export default function DetailPanel({ item, onClose }: DetailPanelProps) {
  const isOpen = item !== null;

  return (
    <aside className={`detail-panel ${isOpen ? 'detail-panel--open' : ''}`} aria-hidden={!isOpen}>
      {item && (
        <>
          <button className="detail-panel__close" onClick={onClose} aria-label="Close details">
            ×
          </button>

          {item.type === 'node' ? (
            <NodeDetail item={item} />
          ) : (
            <EdgeDetail item={item} />
          )}
        </>
      )}
    </aside>
  );
}

function NodeDetail({ item }: { item: Extract<SelectedItem, { type: 'node' }> }) {
  const { data } = item;
  return (
    <div className="detail-panel__body">
      <p className="detail-panel__eyebrow">
        {data.kind === 'trunk' ? 'Trunk stage' : `${data.tributaryKind === 'supplier' ? 'External' : 'Internal'} tributary`}
      </p>
      <h2 className="detail-panel__title">{data.label}</h2>
      <span
        className="detail-panel__pill"
        style={{ background: statusFill(data.status), color: statusInk(data.status) }}
      >
        {statusLabel(data.status)}
      </span>

      <div className="detail-panel__section">
        <p className="detail-panel__section-label">Azure DevOps epic (placeholder)</p>
        <dl className="detail-panel__facts">
          <div>
            <dt>Epic title</dt>
            <dd>{data.detail.epicTitle}</dd>
          </div>
          <div>
            <dt>Epic status</dt>
            <dd>{data.detail.epicStatus}</dd>
          </div>
          <div>
            <dt>Target quarter</dt>
            <dd>{data.detail.quarter}</dd>
          </div>
        </dl>
        <p className="detail-panel__hint">
          Placeholder content. A future version links this card to the live Azure DevOps epic.
        </p>
      </div>
    </div>
  );
}

function EdgeDetail({ item }: { item: Extract<SelectedItem, { type: 'edge' }> }) {
  const { data } = item;
  return (
    <div className="detail-panel__body">
      <p className="detail-panel__eyebrow">{data.kind === 'trunk' ? 'Trunk connection' : 'Tributary connection'}</p>
      <h2 className="detail-panel__title">
        {data.sourceLabel ?? formatLabel(data.source)} → {data.targetLabel ?? formatLabel(data.target)}
      </h2>
      <span
        className="detail-panel__pill"
        style={{ background: edgeColor(data.status), color: '#ffffff' }}
      >
        {edgeStatusLabel(data.status)}
      </span>

      <div className="detail-panel__section">
        <p className="detail-panel__section-label">Note</p>
        <p className="detail-panel__note">{data.annotation}</p>
        <p className="detail-panel__hint">
          A future version links this note to the relevant Azure DevOps work item.
        </p>
      </div>
    </div>
  );
}

function formatLabel(id: string): string {
  return id
    .split('-')
    .filter((part) => !['internal', 'supplier', 'inspection'].includes(part))
    .join(' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
