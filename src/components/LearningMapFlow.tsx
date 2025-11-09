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
import { Sparkles, Zap, Star, TrendingUp } from 'lucide-react';

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
  
  const getIcon = () => {
    if (isMainNode) return <Sparkles className="w-5 h-5" />;
    if (isBranch) return <Zap className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };
  
  return (
    <div className="group relative animate-scale-in">
      {/* Glow effect */}
      <div className={`
        absolute inset-0 rounded-2xl blur-xl transition-all duration-500
        ${isMainNode ? 'bg-primary/40 group-hover:bg-primary/60' : ''}
        ${isBranch ? 'bg-secondary/30 group-hover:bg-secondary/50' : ''}
        ${!isMainNode && !isBranch ? 'bg-accent/20 group-hover:bg-accent/40' : ''}
      `} />
      
      <Card 
        className={`
          relative p-5 border-2 transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-1
          ${isMainNode ? 'bg-gradient-to-br from-primary via-primary/90 to-secondary text-primary-foreground min-w-[320px] shadow-glow border-primary/50' : ''}
          ${isBranch ? 'glass-effect border-secondary/40 min-w-[260px] hover:border-secondary shadow-soft hover:shadow-medium' : ''}
          ${!isMainNode && !isBranch ? 'glass-effect border-accent/30 min-w-[220px] hover:border-accent shadow-soft hover:shadow-medium' : ''}
        `}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`
                p-2 rounded-lg transition-all duration-300 group-hover:rotate-12
                ${isMainNode ? 'bg-primary-foreground/20' : 'bg-primary/10 group-hover:bg-primary/20'}
              `}>
                {getIcon()}
              </div>
              <div className="flex-1">
                <h3 className={`
                  font-display font-bold leading-tight
                  ${isMainNode ? 'text-2xl' : isBranch ? 'text-lg' : 'text-base'}
                `}>
                  {data.label}
                </h3>
              </div>
            </div>
            {data.badge && (
              <Badge 
                variant="secondary" 
                className={`
                  text-xs px-3 py-1 font-semibold
                  ${isMainNode ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30' : 'bg-primary/10 text-primary border-primary/30'}
                  animate-pulse-glow
                `}
              >
                {data.badge}
              </Badge>
            )}
          </div>
          {data.description && (
            <p className={`
              text-sm leading-relaxed
              ${isMainNode ? 'text-primary-foreground/90 font-medium' : 'text-foreground/70'}
            `}>
              {data.description}
            </p>
          )}
          
          {/* Decorative bottom line */}
          <div className={`
            h-1 rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100
            ${isMainNode ? 'bg-gradient-to-r from-primary-foreground/50 to-transparent' : ''}
            ${isBranch ? 'bg-gradient-to-r from-secondary to-transparent' : ''}
            ${!isMainNode && !isBranch ? 'bg-gradient-to-r from-accent to-transparent' : ''}
          `} />
        </div>
      </Card>
    </div>
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
        badge: '🎯 Start'
      },
    });

    // Calculate branch positions in a radial layout
    const branchCount = data.branches.length;
    const radius = 280;
    const angleStep = (2 * Math.PI) / branchCount;

    data.branches.forEach((branch, branchIndex) => {
      const angle = angleStep * branchIndex - Math.PI / 2; // Start from top
      const branchX = 400 + radius * Math.cos(angle);
      const branchY = 220 + radius * Math.sin(angle);

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
        style: { 
          stroke: 'url(#gradient-primary)',
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
          width: 25,
          height: 25,
        },
      });

      // Subtopic nodes
      branch.subtopics.forEach((subtopic, subtopicIndex) => {
        const subtopicAngle = angle + (subtopicIndex - (branch.subtopics.length - 1) / 2) * 0.35;
        const subtopicRadius = 200;
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
          style: { 
            stroke: 'hsl(var(--accent))',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--accent))',
            width: 20,
            height: 20,
          },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, setNodes, setEdges]);

  return (
    <div className="w-full h-[750px] rounded-3xl border-2 border-primary/30 overflow-hidden glass-effect shadow-glow relative group">
      {/* SVG Gradients for edges */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
      </svg>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.4}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        className="bg-background/30"
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={24}
          size={2}
          color="hsl(var(--primary) / 0.15)"
          className="opacity-60"
        />
        <Controls 
          className="glass-effect border-2 border-primary/20 rounded-xl shadow-soft !bg-card/50 backdrop-blur-xl [&_button]:!bg-transparent [&_button]:!border-primary/20 [&_button:hover]:!bg-primary/10 [&_button]:!text-foreground [&_button]:transition-all"
        />
      </ReactFlow>
      
      {/* Corner decorations */}
      <div className="absolute top-4 right-4 flex items-center gap-2 glass-effect px-4 py-2 rounded-xl border border-accent/30 animate-pulse-glow">
        <TrendingUp className="w-4 h-4 text-accent" />
        <span className="text-xs font-bold text-accent uppercase tracking-wider">Live Preview</span>
      </div>
    </div>
  );
};