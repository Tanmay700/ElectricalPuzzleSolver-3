import { Problem } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ProblemListProps {
  problems: Problem[];
  selectedProblem: Problem | null;
  onSelectProblem: (problem: Problem) => void;
}

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-500",
  Medium: "bg-yellow-500/10 text-yellow-500",
  Hard: "bg-red-500/10 text-red-500"
};

export function ProblemList({ problems, selectedProblem, onSelectProblem }: ProblemListProps) {
  return (
    <Card className="h-full border-0 rounded-none">
      <CardHeader>
        <CardTitle>Problems</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2">
            {problems.map((problem) => (
              <div
                key={problem.id}
                onClick={() => onSelectProblem(problem)}
                className={cn(
                  "p-4 rounded-lg cursor-pointer transition-colors",
                  selectedProblem?.id === problem.id
                    ? "bg-primary/10"
                    : "hover:bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium line-clamp-1">{problem.title}</h3>
                  <Badge variant="outline" className={difficultyColors[problem.difficulty]}>
                    {problem.difficulty}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {problem.points} points
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}