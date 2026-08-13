import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { LineageNodeData } from '../../types';
import { statusFill, statusInk } from '../statusColors';

export type TrunkNodeType = Node<LineageNodeData, 'trunk'>;

const HANDLE_STYLE = {
  opacity: 0,
  width: 1,
  height: 1,
  border: 'none',
};

export default function TrunkNode({ data, selected }: NodeProps<TrunkNodeType>) {
  const topCount = data.tributaryHandleCountTop ?? 0;
  const bottomCount = data.tributaryHandleCountBottom ?? 0;
  const levelColor = data.level === 2 ? 'var(--level-2-line)' : 'var(--level-1-line)';

  return (
    <div
      className="rf-trunk-node"
      style={{
        background: statusFill(data.status),
        color: statusInk(data.status),
        outline: selected ? `4px solid var(--text-primary)` : `3px solid ${levelColor}`,
        outlineOffset: selected ? '2px' : '0',
      }}
    >
      <Handle type="target" position={Position.Left} id="left" style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} id="right" style={HANDLE_STYLE} />

      {Array.from({ length: topCount }, (_, i) => (
        <Handle
          key={`top-${i}`}
          type="target"
          position={Position.Top}
          id={`trib-top-${i}`}
          style={{ ...HANDLE_STYLE, left: `${((i + 1) / (topCount + 1)) * 100}%` }}
        />
      ))}

      {Array.from({ length: bottomCount }, (_, i) => (
        <Handle
          key={`bottom-${i}`}
          type="target"
          position={Position.Bottom}
          id={`trib-bottom-${i}`}
          style={{ ...HANDLE_STYLE, left: `${((i + 1) / (bottomCount + 1)) * 100}%` }}
        />
      ))}

      <span className="rf-trunk-node__label">{data.label}</span>
    </div>
  );
}
