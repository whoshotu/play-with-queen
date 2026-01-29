import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

interface FloatingEmoji {
    id: string;
    content: string;
    x: number;
    y: number;
    color?: string;
}

export function EmojiReactions() {
    const chatMessages = useAppStore((s) => s.call.chatMessages);
    const [emojis, setEmojis] = React.useState<FloatingEmoji[]>([]);
    const lastProcessedId = React.useRef<string | null>(null);

    React.useEffect(() => {
        if (chatMessages.length === 0) return;

        const lastMessage = chatMessages[chatMessages.length - 1];

        // Only process if it's a new emoji message
        if (lastMessage.type === "emoji" && lastMessage.id !== lastProcessedId.current) {
            lastProcessedId.current = lastMessage.id;

            // Create a burst of 1-3 emojis
            const count = 1 + Math.floor(Math.random() * 3);
            const newEmojis: FloatingEmoji[] = [];

            for (let i = 0; i < count; i++) {
                newEmojis.push({
                    id: `${lastMessage.id}-${i}`,
                    content: lastMessage.content,
                    // Random position within the center area
                    x: 40 + Math.random() * 20, // percentage
                    y: 40 + Math.random() * 20, // percentage
                });
            }

            setEmojis((prev) => [...prev, ...newEmojis]);

            // Cleanup after animation
            setTimeout(() => {
                setEmojis((prev) => prev.filter((e) => !newEmojis.some(ne => ne.id === e.id)));
            }, 3000);
        }
    }, [chatMessages]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            <AnimatePresence>
                {emojis.map((emoji) => (
                    <motion.div
                        key={emoji.id}
                        initial={{
                            opacity: 0,
                            scale: 0.5,
                            x: `${emoji.x}%`,
                            y: "80%"
                        }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.5, 1.2, 1],
                            y: "10%",
                            x: [`${emoji.x}%`, `${emoji.x + (Math.random() * 20 - 10)}%`]
                        }}
                        transition={{
                            duration: 2.5,
                            ease: "easeOut"
                        }}
                        className="absolute text-5xl select-none"
                        style={{ left: 0, top: 0 }}
                    >
                        {emoji.content}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
