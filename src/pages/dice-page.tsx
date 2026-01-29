import * as React from "react";

import { IndividualDicePreview } from "@/components/dice/individual-dice-preview";
import { IndividualDiceCustomizer } from "@/components/dice/individual-dice-customizer";
import { CallPanel } from "@/components/call/call-panel";
import { ChatPanel } from "@/components/chat/chat-panel";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useAppStore } from "@/store/useAppStore";

export default function DicePage() {
  const individualDice = useAppStore((s) => s.individualDice);
  const lastRoll = useAppStore((s) => s.lastRoll);
  const rollDice = useAppStore((s) => s.rollDice);
  const heldDice = useAppStore((s) => s.heldDice);
  const toggleHold = useAppStore((s) => s.toggleHold);

  const [rolling, setRolling] = React.useState(false);

  // Calculate total of all dice
  const total = lastRoll.reduce((sum, val) => sum + val, 0);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Dice Game</CardTitle>
              <CardDescription>
                Roll your custom dice! Click individual dice to hold them between rolls.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <IndividualDicePreview
                dice={individualDice}
                values={lastRoll}
                rolling={rolling}
                held={heldDice}
                onToggleHold={toggleHold}
              />

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  size="lg"
                  onClick={() => {
                    if (rolling) return;
                    setRolling(true);
                    window.setTimeout(() => {
                      rollDice();
                      setRolling(false);
                    }, 650);
                  }}
                  disabled={rolling}
                >
                  {rolling ? "Rolling..." : "Roll Dice"}
                </Button>
                {individualDice.length > 1 && (
                  <div className="text-muted-foreground w-full text-center text-sm">
                    Total: <span className="text-foreground text-xl font-bold">{total}</span>
                  </div>
                )}
              </div>

              <div className="text-muted-foreground rounded-lg border bg-muted/30 p-3 text-center text-sm">
                💡 <strong>Tip:</strong> Click a die to hold it, then roll again to keep that value!
              </div>
            </CardContent>
          </Card>

          <IndividualDiceCustomizer />
        </div>

        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <ChatPanel />
        </div>
      </div>

      <CallPanel />
    </div>
  );
}
