import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Users } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useAppStore } from "@/store/useAppStore";

export function ChatPanel() {
    const user = useAppStore((s) => s.user);
    const call = useAppStore((s) => s.call);
    const addChatMessage = useAppStore((s) => s.addChatMessage);
    const clearChat = useAppStore((s) => s.clearChat);

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = React.useState(true);

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [call.chatMessages, autoScroll]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
        setAutoScroll(isAtBottom);
    };

    const isAdmin = user?.role === "admin";
    const canChat = call.joined;

    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Chat</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {call.participants.length + 1} participant{call.participants.length !== 0 ? "s" : ""}
                        </CardDescription>
                    </div>
                    {isAdmin && call.chatMessages.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearChat}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-0 overflow-hidden p-0">
                <ScrollArea
                    className="flex-1 px-0"
                    onScrollCapture={handleScroll}
                >
                    <div ref={scrollRef} className="flex flex-col gap-1 pb-4">
                        {call.chatMessages.length === 0 ? (
                            <div className="text-muted-foreground grid place-items-center py-12 text-center text-sm">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            call.chatMessages.map((msg) => (
                                <ChatMessage
                                    key={msg.id}
                                    message={msg}
                                    isOwnMessage={msg.senderName === user?.name}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>

                <ChatInput
                    onSend={addChatMessage}
                    disabled={!canChat}
                />
            </CardContent>
        </Card>
    );
}
