import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { EmojiPickerButton } from "./emoji-picker-button";

export function ChatInput({
    onSend,
    disabled,
}: {
    onSend: (message: string) => void;
    disabled?: boolean;
}) {
    const [message, setMessage] = React.useState("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        const trimmed = message.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setMessage("");
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setMessage((prev) => prev + emoji);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newMessage = message.slice(0, start) + emoji + message.slice(end);

        setMessage(newMessage);

        // Set cursor position after emoji
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            textarea.focus();
        }, 0);
    };

    const charCount = message.length;
    const maxChars = 500;

    return (
        <div className="border-t bg-background p-3">
            <div className="flex gap-2">
                <div className="flex-1">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                        onKeyDown={handleKeyDown}
                        placeholder={disabled ? "Join the call to chat" : "Type a message..."}
                        disabled={disabled}
                        className="min-h-[60px] resize-none"
                        rows={2}
                    />
                    <div className="text-muted-foreground mt-1 text-right text-xs">
                        {charCount}/{maxChars}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
                    <Button
                        onClick={handleSend}
                        disabled={disabled || !message.trim()}
                        size="icon"
                        className="h-[60px] w-[60px]"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
