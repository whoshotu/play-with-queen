import { StagePanel } from "@/components/call/stage-panel";
import { ChatPanel } from "@/components/chat/chat-panel";

export default function CallPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <StagePanel />
      <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
        <ChatPanel />
      </div>
    </div>
  );
}
