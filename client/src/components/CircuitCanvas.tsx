import { Problem, CircuitData } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import ReactFlow, { Controls, Background, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function CircuitCanvas({ problem }: { problem: Problem }) {
  const { toast } = useToast();
  const [answer, setAnswer] = useState("");
  const isMobile = useIsMobile();
  const circuitData = problem.circuitData as CircuitData;

  // Transform circuit data into ReactFlow format
  const nodes: Node[] = useMemo(() => 
    circuitData.nodes.map((node) => ({
      id: node.id,
      type: 'default',
      data: { label: `${node.type} (${node.value})` },
      position: { x: Math.random() * (isMobile ? 300 : 500), y: Math.random() * (isMobile ? 200 : 300) }
    })),
    [circuitData.nodes, isMobile]
  );

  const edges: Edge[] = useMemo(() => 
    circuitData.edges.map((edge, index) => ({
      id: `e${index}`,
      source: edge.source,
      target: edge.target,
      type: 'default'
    })),
    [circuitData.edges]
  );

  const submitMutation = useMutation({
    mutationFn: async (solution: number) => {
      const res = await apiRequest("POST", `/api/problems/${problem.id}/submit`, {
        solution,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.correct) {
        toast({
          title: "Correct!",
          description: `You earned ${problem.points} points!`,
        });
        if (data.user) {
          queryClient.setQueryData(["/api/user"], data.user);
          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        }
        queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      } else {
        toast({
          title: "Incorrect",
          description: "Try again!",
          variant: "destructive",
        });
      }
    },
  });

  return (
    <div className="h-full flex flex-col">
      <Card className="m-2 sm:m-4">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">{problem.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">{problem.description}</p>

          {/* Circuit Image */}
          {problem.imageUrl && (
            <div className="mb-4">
              <img 
                src={problem.imageUrl} 
                alt="Circuit diagram"
                className="max-w-full h-auto rounded-lg border"
              />
            </div>
          )}

          {/* Interactive Circuit */}
          <div className="h-[300px] sm:h-[400px] border rounded-md">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Input
            type="number"
            placeholder="Enter your answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Button
            onClick={() => submitMutation.mutate(Number(answer))}
            disabled={submitMutation.isPending}
            className="w-full sm:w-auto"
          >
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}