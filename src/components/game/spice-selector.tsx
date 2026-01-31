import { Flame, Thermometer, ThermometerSnowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpiceLevel } from "@/lib/types";

interface SpiceSelectorProps {
  value: SpiceLevel;
  onChange: (level: SpiceLevel) => void;
  disabled?: boolean;
}

const SPICE_OPTIONS: { value: SpiceLevel; label: string; icon: typeof ThermometerSnowflake; color: string }[] = [
  { value: "mild", label: "Mild", icon: ThermometerSnowflake, color: "text-blue-500" },
  { value: "medium", label: "Medium", icon: Thermometer, color: "text-yellow-500" },
  { value: "spicy", label: "Hot", icon: Flame, color: "text-red-500" },
];

export function SpiceSelector({ value, onChange, disabled }: SpiceSelectorProps) {
  return (
    <div className="flex gap-2">
      {SPICE_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className={cn("h-4 w-4", !isSelected && option.color)} />
            <span className="font-medium">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
