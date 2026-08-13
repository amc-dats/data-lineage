import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { LineageNodeData } from '../../types';
import { statusFill, statusInk } from '../statusColors';

export type TributaryNodeType = Node<LineageNodeData, 'tributary'>;

export default function TributaryNode({ data, selected }: NodeProps<TributaryNodeType>) {
  const isSupplier = data.tributaryKind === 'supplier';
  const isBelow = data.branchSide === 'below';

  return (
    <div
      className={`rf-tributary-node rf-tributary-node--${data.tributaryKind}`}
      style={{
        background: statusFill(data.status),
        color: statusInk(data.status),
        outline: selected ? '3px solid var(--text-primary)' : undefined,
        outlineOffset: selected ? '2px' : undefined,
      }}
    >
      <Handle
        type="source"
        position={isBelow ? Position.Top : Position.Bottom}
        id={isBelow ? 'top' : 'bottom'}
        style={{ opacity: 0, width: 1, height: 1, border: 'none' }}
      />
      <span className="rf-tributary-node__icon" aria-hidden="true">
        {isSupplier ? '⛟' : '⚙'}
      </span>
      <span className="rf-tributary-node__label">{data.label}</span>
    </div>
  );
}
