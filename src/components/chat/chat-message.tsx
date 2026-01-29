import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

export function ChatMessage({ message, isOwnMessage }: {
    message: ChatMessageType;
    isOwnMessage: boolean;
}) {
    const isSystem = message.type === "system";

    if (isSystem) {
        return (
            <div className="flex justify-center py-2">
                <div className="text-muted-foreground rounded-full bg-muted px-3 py-1 text-xs">
                    {message.content}
                </div>
            </div>
        );
    }

    const isEmojiOnly = React.useMemo(() => {
        const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|[\s\u200d])+$/;
        return emojiRegex.test(message.content);
    }, [message.content]);

    return (
        <div
            className={cn(
                "flex flex-col gap-1 px-3 py-2",
                isOwnMessage ? "items-end" : "items-start"
            )}
        >
            <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium">{message.senderName}</span>
                <span className="text-muted-foreground text-[10px]">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                </span>
            </div>
            <div
                className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm transition-all",
                    isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    isEmojiOnly && "bg-transparent px-0 py-0 text-3xl text-foreground"
                )}
            >
                {message.content}
            </div>
        </div>
    );
}
