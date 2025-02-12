import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export function Leaderboard() {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/leaderboard"],
  });

  return (
    <Card className="h-full border-0 rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 rounded-lg bg-primary/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold min-w-[24px]">
                  #{index + 1}
                </span>
                <span>{user.username}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {user.points} points
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
