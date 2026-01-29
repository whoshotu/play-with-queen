import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { IndividualDiceConfig } from "@/lib/types";

export function IndividualDicePreview(props: {
    dice: IndividualDiceConfig[];
    values: number[];
    rolling: boolean;
    held?: boolean[];
    onToggleHold?: (index: number) => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-4">
            {props.dice.map((die, index) => {
                const value = props.values[index] ?? 1;
                const label = die.faceLabels[(Math.max(1, Math.min(6, value)) - 1) as 0 | 1 | 2 | 3 | 4 | 5];
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
                        key={`${die.id}_${index}`}
                        onClick={() => props.onToggleHold?.(index)}
                        className={cn(
                            "relative grid size-24 cursor-pointer place-items-center rounded-2xl border shadow-sm transition-transform active:scale-95",
                            "select-none",
                            isHeld ? "ring-4 ring-primary ring-offset-2" : "hover:border-primary/50"
                        )}
                        style={{
                            backgroundColor: die.diceColor,
                            color: die.faceTextColor,
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
                        {/* Die number indicator */}
                        <div className="absolute -bottom-1 -left-1 grid size-5 place-items-center rounded-full bg-background text-[10px] font-bold shadow-sm">
                            {index + 1}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
