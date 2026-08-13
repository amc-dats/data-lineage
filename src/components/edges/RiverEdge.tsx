import { BaseEdge, getSmoothStepPath, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import type { LineageEdgeData } from '../../types';
import { edgeColor } from '../statusColors';

export type RiverEdgeType = Edge<LineageEdgeData, 'river'>;

export default function RiverEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<RiverEdgeType>) {
  if (!data) return null;

  const isTrunk = data.kind === 'trunk';

  const [path] = isTrunk
    ? getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
    : getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 24,
      });

  const color = edgeColor(data.status);

  return (
    <BaseEdge
      id={id}
      path={path}
      interactionWidth={24}
      style={{
        stroke: color,
        strokeWidth: isTrunk ? (selected ? 8 : 6) : selected ? 5 : 3.5,
        strokeDasharray: data.status === 'red' ? '9 6' : undefined,
        filter: selected ? 'drop-shadow(0 0 0 var(--text-primary))' : undefined,
        opacity: selected ? 1 : 0.92,
        cursor: 'pointer',
      }}
    />
  );
}
