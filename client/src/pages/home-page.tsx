import { useAuth } from "@/hooks/use-auth";
import { CircuitCanvas } from "@/components/CircuitCanvas";
import { ProblemList } from "@/components/ProblemList";
import { Leaderboard } from "@/components/Leaderboard";
import { ProblemForm } from "@/components/ProblemForm";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useQuery } from "@tanstack/react-query";
import { Problem } from "@shared/schema";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { data: problems = [] } = useQuery<Problem[]>({
    queryKey: ["/api/problems"],
  });

  const MobileNavigation = () => (
    <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
      <SheetContent side="left" className="w-[85%] sm:w-[400px] p-0">
        <div className="h-full flex flex-col">
          <ProblemList
            problems={problems}
            selectedProblem={selectedProblem}
            onSelectProblem={(problem) => {
              setSelectedProblem(problem);
              setShowMobileMenu(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold">Circuit Master</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create New Problem</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ProblemForm />
              </div>
            </SheetContent>
          </Sheet>
          <span className="hidden sm:inline text-sm text-muted-foreground">
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

      {isMobile ? (
        <>
          <MobileNavigation />
          <div className="flex-1 flex flex-col">
            {selectedProblem ? (
              <CircuitCanvas problem={selectedProblem} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground p-4 text-center">
                Select a problem from the menu to begin
              </div>
            )}
          </div>
        </>
      ) : (
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
      )}
    </div>
  );
}