import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Copy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { IndividualDiceConfig } from "@/lib/types";

function DieCustomizer({
    die,
    index,
    onUpdate,
    onRemove,
    onCopy,
    canRemove,
}: {
    die: IndividualDiceConfig;
    index: number;
    onUpdate: (patch: Partial<Omit<IndividualDiceConfig, "id">>) => void;
    onRemove: () => void;
    onCopy: () => void;
    canRemove: boolean;
}) {
    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Die {index + 1} Configuration</h4>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={onCopy}>
                        <Copy className="h-3 w-3" />
                        Copy
                    </Button>
                    {canRemove && (
                        <Button size="sm" variant="destructive" onClick={onRemove}>
                            <Trash2 className="h-3 w-3" />
                            Remove
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-3">
                <div className="grid gap-2">
                    <Label htmlFor={`die-${die.id}-color`}>Die Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id={`die-${die.id}-color`}
                            type="color"
                            value={die.diceColor}
                            onChange={(e) => onUpdate({ diceColor: e.target.value })}
                            className="h-10 w-20"
                        />
                        <Input
                            type="text"
                            value={die.diceColor}
                            onChange={(e) => onUpdate({ diceColor: e.target.value })}
                            className="flex-1 font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`die-${die.id}-text-color`}>Face Text Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id={`die-${die.id}-text-color`}
                            type="color"
                            value={die.faceTextColor}
                            onChange={(e) => onUpdate({ faceTextColor: e.target.value })}
                            className="h-10 w-20"
                        />
                        <Input
                            type="text"
                            value={die.faceTextColor}
                            onChange={(e) => onUpdate({ faceTextColor: e.target.value })}
                            className="flex-1 font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>Face Labels</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {die.faceLabels.map((label, faceIndex) => (
                            <div key={faceIndex} className="grid gap-1">
                                <Label htmlFor={`die-${die.id}-face-${faceIndex}`} className="text-xs">
                                    Face {faceIndex + 1}
                                </Label>
                                <Input
                                    id={`die-${die.id}-face-${faceIndex}`}
                                    value={label}
                                    onChange={(e) => {
                                        const newLabels = [...die.faceLabels] as IndividualDiceConfig["faceLabels"];
                                        newLabels[faceIndex as 0 | 1 | 2 | 3 | 4 | 5] = e.target.value;
                                        onUpdate({ faceLabels: newLabels });
                                    }}
                                    maxLength={20}
                                    className="text-center"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div className="grid gap-2">
                    <Label>Preview</Label>
                    <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
                        <div
                            className="grid size-24 place-items-center rounded-2xl border shadow-sm"
                            style={{
                                backgroundColor: die.diceColor,
                                color: die.faceTextColor,
                            }}
                        >
                            <div className="px-2 text-center text-xl font-bold leading-tight">
                                {die.faceLabels[0]}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function IndividualDiceCustomizer() {
    const individualDice = useAppStore((s) => s.individualDice);
    const addIndividualDie = useAppStore((s) => s.addIndividualDie);
    const removeIndividualDie = useAppStore((s) => s.removeIndividualDie);
    const updateIndividualDie = useAppStore((s) => s.updateIndividualDie);

    const [copiedConfig, setCopiedConfig] = React.useState<Omit<IndividualDiceConfig, "id"> | null>(null);

    const handleCopy = (die: IndividualDiceConfig) => {
        setCopiedConfig({
            diceColor: die.diceColor,
            faceTextColor: die.faceTextColor,
            faceLabels: die.faceLabels,
        });
    };

    const handlePaste = (dieId: string) => {
        if (copiedConfig) {
            updateIndividualDie(dieId, copiedConfig);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Individual Dice Configuration</CardTitle>
                        <CardDescription>
                            Customize each die separately (up to 6 dice)
                        </CardDescription>
                    </div>
                    <Button
                        onClick={addIndividualDie}
                        disabled={individualDice.length >= 6}
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Die
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {individualDice.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-sm">
                        No dice configured. Click "Add Die" to get started.
                    </div>
                ) : (
                    <Tabs defaultValue={individualDice[0]?.id} className="w-full">
                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${individualDice.length}, 1fr)` }}>
                            {individualDice.map((die, index) => (
                                <TabsTrigger key={die.id} value={die.id}>
                                    Die {index + 1}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {individualDice.map((die, index) => (
                            <TabsContent key={die.id} value={die.id} className="mt-4">
                                <DieCustomizer
                                    die={die}
                                    index={index}
                                    onUpdate={(patch) => updateIndividualDie(die.id, patch)}
                                    onRemove={() => removeIndividualDie(die.id)}
                                    onCopy={() => handleCopy(die)}
                                    canRemove={individualDice.length > 1}
                                />
                                {copiedConfig && (
                                    <div className="mt-4 rounded-lg border bg-muted/50 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Configuration copied!</span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePaste(die.id)}
                                            >
                                                Paste to this die
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}
