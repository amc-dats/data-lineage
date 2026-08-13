import type { LineageNodeData, LineageEdgeData } from '../types';

export type SelectedItem =
  | { type: 'node'; data: LineageNodeData }
  | { type: 'edge'; data: LineageEdgeData };

export type HoveredItem = SelectedItem;
