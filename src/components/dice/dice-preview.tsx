import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { DiceConfig } from "@/lib/types";

function clampDiceCount(n: number) {
  if (!Number.isFinite(n)) return 2;
  return Math.max(1, Math.min(6, Math.round(n)));
}

export function DicePreview(props: {
  config: DiceConfig;
  values: number[];
  rolling: boolean;
  held?: boolean[];
  onToggleHold?: (index: number) => void;
}) {
  const diceCount = clampDiceCount(props.config.diceCount);
  const values = Array.from({ length: diceCount }).map((_, idx) => props.values[idx] ?? 1);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {values.map((v, index) => {
        const label = props.config.faceLabels[(Math.max(1, Math.min(6, v)) - 1) as 0 | 1 | 2 | 3 | 4 | 5];
        const safeLabel = (label ?? "").toString();
        const labelLength = safeLabel.length;
        const textClass =
          labelLength > 12
            ? "text-base"
            : labelLength > 7
              ? "text-lg"
              : labelLength > 3
                ? "text-xl"
                : "text-3xl";

        const isHeld = props.held?.[index] ?? false;

        return (
          <motion.div
            key={`${index}_${safeLabel}`}
            onClick={() => props.onToggleHold?.(index)}
            className={cn(
              "relative grid size-24 cursor-pointer place-items-center rounded-2xl border shadow-sm transition-transform active:scale-95",
              "select-none",
              isHeld ? "ring-4 ring-primary ring-offset-2" : "hover:border-primary/50"
            )}
            style={{
              backgroundColor: props.config.diceColor,
              color: props.config.faceTextColor,
            }}
            animate={
              props.rolling && !isHeld
                ? {
                  rotate: [0, 45, 120, 220, 360],
                  scale: [1, 1.03, 0.98, 1.02, 1],
                  y: [0, -8, 0],
                }
                : { rotate: 0, scale: 1, y: 0 }
            }
            transition={props.rolling && !isHeld ? { duration: 0.75, ease: "easeInOut" } : { duration: 0.2 }}
          >
            <div className={cn("px-2 text-center font-bold leading-tight tracking-tight", textClass)}>
              {safeLabel}
            </div>
            {isHeld && (
              <div className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                H
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
