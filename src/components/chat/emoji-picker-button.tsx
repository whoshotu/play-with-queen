import * as React from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

export function EmojiPickerButton({
    onEmojiSelect,
}: {
    onEmojiSelect: (emoji: string) => void;
}) {
    const [open, setOpen] = React.useState(false);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiSelect(emojiData.emoji);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-[60px] w-[60px]"
                >
                    <Smile className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="end">
                <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={Theme.AUTO}
                    width="100%"
                    height={400}
                    searchPlaceHolder="Search emoji..."
                    previewConfig={{ showPreview: false }}
                />
            </PopoverContent>
        </Popover>
    );
}
