export type Status = 'red' | 'amber' | 'green';
export type EdgeStatus = 'red' | 'green';
export type TributaryKind = 'internal' | 'supplier';

/** Placeholder for what will later be a linked Azure DevOps epic. */
export interface EpicDetail {
  epicTitle: string;
  epicStatus: string;
  quarter: string;
}

export interface LineageNodeData {
  [key: string]: unknown;
  id: string;
  kind: 'trunk' | 'tributary';
  tributaryKind?: TributaryKind;
  /** Trunk node this tributary feeds into (tributary nodes only). */
  parentTrunk?: string;
  label: string;
  status: Status;
  position: { x: number; y: number };
  detail: EpicDetail;
  /** Resolved at load time: how many tributary handles this trunk node renders above / below it. Trunk nodes only. */
  tributaryHandleCountTop?: number;
  tributaryHandleCountBottom?: number;
  /** Resolved at load time from its position relative to its parent trunk. Tributary nodes only. */
  branchSide?: 'above' | 'below';
}

export interface LineageEdgeData {
  [key: string]: unknown;
  id: string;
  source: string;
  target: string;
  kind: 'trunk' | 'tributary';
  status: EdgeStatus;
  /** Click-through note; in a later version this becomes a link to an ADO work item. */
  annotation: string;
  /** Resolved at load time from the node list, for display purposes only. */
  sourceLabel?: string;
  targetLabel?: string;
}

export interface LineageData {
  nodes: LineageNodeData[];
  edges: LineageEdgeData[];
}
