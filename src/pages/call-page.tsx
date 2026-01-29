import { CallPanel } from "@/components/call/call-panel";
import { ChatPanel } from "@/components/chat/chat-panel";

export default function CallPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <CallPanel
        title="Multi-Camera Call"
        description="Add participants, enable cameras, and drag/resize video boxes. Use the dice overlay for interactive gameplay."
      />
      <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
        <ChatPanel />
      </div>
    </div>
  );
}
