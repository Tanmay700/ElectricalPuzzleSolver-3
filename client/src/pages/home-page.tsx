import { useAuth } from "@/hooks/use-auth";
import { CircuitCanvas } from "@/components/CircuitCanvas";
import { ProblemList } from "@/components/ProblemList";
import { Leaderboard } from "@/components/Leaderboard";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useQuery } from "@tanstack/react-query";
import { Problem } from "@shared/schema";
import { useState } from "react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const { data: problems = [] } = useQuery<Problem[]>({
    queryKey: ["/api/problems"],
  });

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Circuit Master</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.username} - {user?.points} points
          </span>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={25} minSize={20}>
          <ProblemList
            problems={problems}
            selectedProblem={selectedProblem}
            onSelectProblem={setSelectedProblem}
          />
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={50}>
          {selectedProblem ? (
            <CircuitCanvas problem={selectedProblem} />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a problem to begin
            </div>
          )}
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={25}>
          <Leaderboard />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
