import { cn } from "@/lib/utils";
import { User, Crown, SkipForward } from "lucide-react";

interface PlayerTurnIndicatorProps {
  playerName: string | null;
  isCurrentUser: boolean;
  skipsRemaining: number;
}

export function PlayerTurnIndicator({ 
  playerName, 
  isCurrentUser, 
  skipsRemaining 
}: PlayerTurnIndicatorProps) {
  if (!playerName) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/25">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Waiting for players...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border",
      isCurrentUser 
        ? "bg-primary/5 border-primary/20" 
        : "bg-muted/50 border-border"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center",
          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isCurrentUser ? (
            <Crown className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium">
            {isCurrentUser ? "Your Turn" : `${playerName}'s Turn`}
          </p>
          {isCurrentUser && (
            <p className="text-xs text-muted-foreground">
              Choose Truth or Dare
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <SkipForward className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {skipsRemaining} skip{skipsRemaining !== 1 ? "s" : ""} left
        </span>
      </div>
    </div>
  );
}
