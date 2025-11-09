import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Subtopic {
  id: string;
  name: string;
  description: string;
}

interface Branch {
  id: string;
  name: string;
  description: string;
  subtopics: Subtopic[];
}

interface LearningMapData {
  topic: string;
  branches: Branch[];
}

interface LearningMapFlowProps {
  data: LearningMapData;
}

const CustomNode = ({ data }: { data: any }) => {
  const isMainNode = data.type === 'main';
  const isBranch = data.type === 'branch';
  
  return (
    <Card 
      className={`
        p-4 border-2 transition-all duration-300 hover:shadow-lg
        ${isMainNode ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground min-w-[280px] shadow-medium' : ''}
        ${isBranch ? 'bg-card border-primary/30 min-w-[240px] hover:border-primary' : ''}
        ${!isMainNode && !isBranch ? 'bg-card/80 border-accent/40 min-w-[200px] hover:border-accent' : ''}
      `}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`font-semibold ${isMainNode ? 'text-xl' : 'text-base'}`}>
            {data.label}
          </h3>
          {data.badge && (
            <Badge variant="secondary" className="text-xs">
              {data.badge}
            </Badge>
          )}
        </div>
        {data.description && (
          <p className={`text-sm ${isMainNode ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
            {data.description}
          </p>
        )}
      </div>
    </Card>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export const LearningMapFlow = ({ data }: LearningMapFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!data || !data.branches) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Main topic node (center)
    newNodes.push({
      id: 'main',
      type: 'custom',
      position: { x: 400, y: 50 },
      data: { 
        label: data.topic,
        type: 'main',
        badge: 'Start Here'
      },
    });

    // Calculate branch positions in a radial layout
    const branchCount = data.branches.length;
    const radius = 250;
    const angleStep = (2 * Math.PI) / branchCount;

    data.branches.forEach((branch, branchIndex) => {
      const angle = angleStep * branchIndex - Math.PI / 2; // Start from top
      const branchX = 400 + radius * Math.cos(angle);
      const branchY = 200 + radius * Math.sin(angle);

      // Branch node
      newNodes.push({
        id: branch.id,
        type: 'custom',
        position: { x: branchX, y: branchY },
        data: { 
          label: branch.name,
          description: branch.description,
          type: 'branch',
          badge: `Branch ${branchIndex + 1}`
        },
      });

      // Edge from main to branch
      newEdges.push({
        id: `main-${branch.id}`,
        source: 'main',
        target: branch.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      });

      // Subtopic nodes
      branch.subtopics.forEach((subtopic, subtopicIndex) => {
        const subtopicAngle = angle + (subtopicIndex - (branch.subtopics.length - 1) / 2) * 0.3;
        const subtopicRadius = 180;
        const subtopicX = branchX + subtopicRadius * Math.cos(subtopicAngle);
        const subtopicY = branchY + subtopicRadius * Math.sin(subtopicAngle);

        newNodes.push({
          id: subtopic.id,
          type: 'custom',
          position: { x: subtopicX, y: subtopicY },
          data: { 
            label: subtopic.name,
            description: subtopic.description,
            type: 'subtopic'
          },
        });

        // Edge from branch to subtopic
        newEdges.push({
          id: `${branch.id}-${subtopic.id}`,
          source: branch.id,
          target: subtopic.id,
          type: 'smoothstep',
          style: { stroke: 'hsl(var(--accent))', strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--accent))',
          },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, setNodes, setEdges]);

  return (
    <div className="w-full h-[700px] rounded-xl border-2 border-border overflow-hidden bg-background/50 backdrop-blur-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        className="bg-gradient-subtle"
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--border))"
        />
        <Controls 
          className="bg-card border border-border rounded-lg shadow-soft"
        />
      </ReactFlow>
    </div>
  );
};