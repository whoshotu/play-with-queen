import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { DiceConfig } from "@/lib/types";

export function DiceCustomizer(props: {
  config: DiceConfig;
  onChange: (patch: Partial<DiceConfig>) => void;
  onChangeFace: (index: 0 | 1 | 2 | 3 | 4 | 5, value: string) => void;
  disabled?: boolean;
  onReset?: () => void;
}) {
  const disabled = !!props.disabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize dice</CardTitle>
        <CardDescription>Choose colors and any words/emoji for each face.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label>Dice count (1–6)</Label>
            <Input
              type="number"
              min={1}
              max={6}
              value={props.config.diceCount}
              disabled={disabled}
              onChange={(e) => props.onChange({ diceCount: Number(e.target.value) })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Dice color</Label>
            <Input
              type="color"
              value={props.config.diceColor}
              disabled={disabled}
              onChange={(e) => props.onChange({ diceColor: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Text color</Label>
            <Input
              type="color"
              value={props.config.faceTextColor}
              disabled={disabled}
              onChange={(e) => props.onChange({ faceTextColor: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="text-sm font-medium">Face labels</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {props.config.faceLabels.map((label, idx) => (
              <div key={idx} className="grid gap-2">
                <Label>{`Face ${idx + 1}`}</Label>
                <Input
                  value={label}
                  disabled={disabled}
                  onChange={(e) => props.onChangeFace(idx as 0 | 1 | 2 | 3 | 4 | 5, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {props.onReset ? (
          <div className="flex justify-end">
            <Button variant="outline" onClick={props.onReset} disabled={disabled}>
              Reset
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
