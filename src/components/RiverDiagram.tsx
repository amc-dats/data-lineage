import { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import lineageData from '../data/lineage.json';
import type { LineageData, LineageNodeData, LineageEdgeData } from '../types';
import TrunkNode from './nodes/TrunkNode';
import TributaryNode from './nodes/TributaryNode';
import RiverEdge from './edges/RiverEdge';
import DetailPanel from './DetailPanel';
import HoverTooltip from './HoverTooltip';
import Legend from './Legend';
import type { SelectedItem, HoveredItem } from './SelectedItem';

const data = lineageData as LineageData;

const nodeTypes = { trunk: TrunkNode, tributary: TributaryNode };
const edgeTypes = { river: RiverEdge };

const NODE_WIDTH = { trunk: 190, tributary: 168 };

interface TributaryLayout {
  topCountByTrunk: Map<string, number>;
  bottomCountByTrunk: Map<string, number>;
  branchSideBySourceId: Map<string, 'above' | 'below'>;
  targetHandleByEdgeId: Map<string, string>;
}

/**
 * Trunk nodes take a variable number of tributaries, some branching in above
 * the trunk and some below (inferred from each tributary's y position relative
 * to its parent trunk). Each trunk node gets one handle per incoming tributary
 * on the relevant side, ordered left-to-right by the tributary's x position so
 * the fan of incoming edges doesn't cross itself.
 */
function computeTributaryLayout(): TributaryLayout {
  const nodeById = new Map(data.nodes.map((n) => [n.id, n]));
  const topGroups = new Map<string, LineageEdgeData[]>();
  const bottomGroups = new Map<string, LineageEdgeData[]>();
  const branchSideBySourceId = new Map<string, 'above' | 'below'>();

  for (const e of data.edges) {
    if (e.kind !== 'tributary') continue;
    const trunk = nodeById.get(e.target);
    const source = nodeById.get(e.source);
    if (!trunk || !source) continue;

    const side: 'above' | 'below' = source.position.y > trunk.position.y ? 'below' : 'above';
    branchSideBySourceId.set(e.source, side);

    const groups = side === 'above' ? topGroups : bottomGroups;
    const group = groups.get(e.target) ?? [];
    group.push(e);
    groups.set(e.target, group);
  }

  const targetHandleByEdgeId = new Map<string, string>();
  for (const [prefix, groups] of [
    ['trib-top', topGroups],
    ['trib-bottom', bottomGroups],
  ] as const) {
    for (const group of groups.values()) {
      group.sort((a, b) => (nodeById.get(a.source)?.position.x ?? 0) - (nodeById.get(b.source)?.position.x ?? 0));
      group.forEach((e, i) => targetHandleByEdgeId.set(e.id, `${prefix}-${i}`));
    }
  }

  const topCountByTrunk = new Map([...topGroups].map(([trunkId, group]) => [trunkId, group.length]));
  const bottomCountByTrunk = new Map([...bottomGroups].map(([trunkId, group]) => [trunkId, group.length]));

  return { topCountByTrunk, bottomCountByTrunk, branchSideBySourceId, targetHandleByEdgeId };
}

function buildFlowNodes(layout: TributaryLayout): Node<LineageNodeData>[] {
  return data.nodes.map((n) => {
    if (n.kind === 'trunk') {
      return {
        id: n.id,
        type: n.kind,
        position: n.position,
        data: {
          ...n,
          tributaryHandleCountTop: layout.topCountByTrunk.get(n.id) ?? 0,
          tributaryHandleCountBottom: layout.bottomCountByTrunk.get(n.id) ?? 0,
        },
        draggable: false,
        selectable: true,
        width: NODE_WIDTH.trunk,
      };
    }

    return {
      id: n.id,
      type: n.kind,
      position: n.position,
      data: { ...n, branchSide: layout.branchSideBySourceId.get(n.id) },
      draggable: false,
      selectable: true,
      width: NODE_WIDTH.tributary,
    };
  });
}

function buildFlowEdges(layout: TributaryLayout): Edge<LineageEdgeData>[] {
  const labelById = new Map(data.nodes.map((n) => [n.id, n.label]));

  return data.edges.map((e) => {
    const enriched: LineageEdgeData = {
      ...e,
      sourceLabel: labelById.get(e.source),
      targetLabel: labelById.get(e.target),
    };

    const branchSide = layout.branchSideBySourceId.get(e.source);

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.kind === 'tributary' ? (branchSide === 'below' ? 'top' : 'bottom') : 'right',
      targetHandle: e.kind === 'trunk' ? 'left' : layout.targetHandleByEdgeId.get(e.id),
      type: 'river',
      data: enriched,
      selectable: true,
    };
  });
}

export default function RiverDiagram() {
  const tributaryLayout = useMemo(computeTributaryLayout, []);
  const flowNodes = useMemo(() => buildFlowNodes(tributaryLayout), [tributaryLayout]);
  const flowEdges = useMemo(() => buildFlowEdges(tributaryLayout), [tributaryLayout]);

  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [hovered, setHovered] = useState<HoveredItem | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const onPaneMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const onNodeClick: NodeMouseHandler<Node<LineageNodeData>> = useCallback((_e, node) => {
    setSelected({ type: 'node', data: node.data });
  }, []);

  const onEdgeClick: EdgeMouseHandler<Edge<LineageEdgeData>> = useCallback((_e, edge) => {
    if (edge.data) setSelected({ type: 'edge', data: edge.data });
  }, []);

  const onNodeMouseEnter: NodeMouseHandler<Node<LineageNodeData>> = useCallback((_e, node) => {
    setHovered({ type: 'node', data: node.data });
  }, []);

  const onEdgeMouseEnter: EdgeMouseHandler<Edge<LineageEdgeData>> = useCallback((_e, edge) => {
    if (edge.data) setHovered({ type: 'edge', data: edge.data });
  }, []);

  const clearHover = useCallback(() => setHovered(null), []);
  const closePanel = useCallback(() => setSelected(null), []);
  const onPaneClick = useCallback(() => setSelected(null), []);

  return (
    <div className="river-diagram" onMouseMove={onPaneMouseMove}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={clearHover}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={clearHover}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.4}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        zoomOnScroll
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="var(--gridline)" />
      </ReactFlow>

      <Legend />
      <HoverTooltip item={selected ? null : hovered} position={mousePos} />
      <DetailPanel item={selected} onClose={closePanel} />
    </div>
  );
}
