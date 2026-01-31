import { cn } from "@/lib/utils";
import type { TruthOrDarePrompt, SpiceLevel } from "@/lib/types";
import { HelpCircle, Zap, AlertTriangle, Flame } from "lucide-react";

interface PromptCardProps {
  prompt: TruthOrDarePrompt | null;
  isRevealed?: boolean;
}

const SPICE_ICONS: Record<SpiceLevel, typeof HelpCircle> = {
  mild: HelpCircle,
  medium: Zap,
  spicy: AlertTriangle,
  extreme: Flame,
};

const SPICE_COLORS: Record<SpiceLevel, string> = {
  mild: "text-blue-500 bg-blue-50 border-blue-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  spicy: "text-orange-600 bg-orange-50 border-orange-200",
  extreme: "text-red-600 bg-red-50 border-red-200",
};

export function PromptCard({ prompt, isRevealed = true }: PromptCardProps) {
  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 min-h-[200px]">
        <HelpCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-center">
          Roll the dice to get a prompt
        </p>
      </div>
    );
  }

  const SpiceIcon = SPICE_ICONS[prompt.spice];
  const spiceColorClass = SPICE_COLORS[prompt.spice];

  return (
    <div className={cn(
      "relative p-6 rounded-xl border-2 transition-all duration-500",
      isRevealed ? "opacity-100 scale-100" : "opacity-0 scale-95",
      spiceColorClass
    )}>
      <div className="flex items-start justify-between mb-4">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
          spiceColorClass
        )}>
          <SpiceIcon className="h-3.5 w-3.5" />
          {prompt.spice}
        </span>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {prompt.type}
        </span>
      </div>
      
      <p className="text-lg font-medium leading-relaxed">
        {prompt.text}
      </p>
    </div>
  );
}
