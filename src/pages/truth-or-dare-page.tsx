import { TruthOrDarePanel } from "@/components/game/truth-or-dare-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function TruthOrDarePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <HelpCircle className="h-6 w-6" />
            Truth or Dare
          </CardTitle>
          <CardDescription>
            Take turns answering questions or completing challenges. Roll the dice to decide who goes first!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TruthOrDarePanel />
        </CardContent>
      </Card>
    </div>
  );
}
