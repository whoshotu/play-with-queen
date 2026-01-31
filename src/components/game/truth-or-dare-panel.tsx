import { useTruthOrDareStore } from "@/store/useTruthOrDareStore";
import { useAppStore } from "@/store/useAppStore";
import { SpiceSelector } from "./spice-selector";
import { PromptCard } from "./prompt-card";
import { PlayerTurnIndicator } from "./player-turn-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Shield, Swords, RotateCcw } from "lucide-react";


export function TruthOrDarePanel() {
  const user = useAppStore((state) => state.user);
  const { 
    currentPrompt, 
    playerTurn, 
    spiceMode, 
    skipsRemaining,
    setSpiceMode,
    skipTurn,
    forfeitTurn,
    completeTurn,
    resetGame,
  } = useTruthOrDareStore();

  const isCurrentUserTurn = playerTurn === user?.id;
  const hasPrompt = currentPrompt !== null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Truth or Dare
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetGame}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <PlayerTurnIndicator
          playerName={playerTurn}
          isCurrentUser={isCurrentUserTurn}
          skipsRemaining={skipsRemaining}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Spice Level</label>
          <SpiceSelector
            value={spiceMode}
            onChange={setSpiceMode}
            disabled={hasPrompt}
          />
        </div>

        <PromptCard prompt={currentPrompt} isRevealed={hasPrompt} />

        {isCurrentUserTurn && (
          <div className="space-y-4">
            {!hasPrompt ? (
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={() => {
                    // TODO: Select truth prompt
                  }}
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Truth
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    // TODO: Select dare prompt
                  }}
                >
                  <Swords className="h-5 w-5 mr-2" />
                  Dare
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={skipTurn}
                  disabled={skipsRemaining === 0}
                >
                  Skip ({skipsRemaining} left)
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={forfeitTurn}
                >
                  Forfeit
                </Button>
                <Button
                  className="flex-1"
                  onClick={completeTurn}
                >
                  Complete
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
