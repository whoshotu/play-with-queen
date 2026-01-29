import * as React from "react";
import { Rnd } from "react-rnd";
import { VideoOff, GripVertical, Video } from "lucide-react";
import type { Participant } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";

interface DraggableVideoBoxProps {
    participant: Participant;
    onPositionChange: (x: number, y: number) => void;
    onSizeChange: (width: number, height: number) => void;
    onCameraToggle: (enabled: boolean) => void;
    isRemote?: boolean;
    userId?: string;
}

export function DraggableVideoBox({
    participant,
    onPositionChange,
    onSizeChange,
    onCameraToggle,
    isRemote = true,
    userId,
}: DraggableVideoBoxProps) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const remoteStreams = useAppStore((s) => s.remoteStreams);
    const stream = userId ? remoteStreams.get(userId) : null;

    React.useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <Rnd
            position={{ x: participant.position.x, y: participant.position.y }}
            size={{ width: participant.size.width, height: participant.size.height }}
            onDragStop={(e, d) => {
                onPositionChange(d.x, d.y);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                onSizeChange(parseInt(ref.style.width), parseInt(ref.style.height));
                onPositionChange(position.x, position.y);
            }}
            minWidth={200}
            minHeight={150}
            bounds="parent"
            dragHandleClassName="drag-handle"
            className="group"
        >
            <div className="relative h-full w-full overflow-hidden rounded-lg border-2 border-border bg-black shadow-lg">
                {/* Drag Handle */}
                <div className="drag-handle absolute left-0 right-0 top-0 z-10 flex cursor-move items-center justify-between bg-black/60 px-2 py-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-white/80" />
                        <span className="text-xs font-medium text-white">{participant.name}</span>
                    </div>
                    {!isRemote && (
                        <button
                            onClick={() => onCameraToggle(!participant.cameraEnabled)}
                            className="rounded-full bg-white/20 p-1 hover:bg-white/30 transition-colors"
                        >
                            {participant.cameraEnabled ? (
                                <Video className="h-3 w-3 text-white" />
                            ) : (
                                <VideoOff className="h-3 w-3 text-white" />
                            )}
                        </button>
                    )}
                </div>

                {/* Video Content */}
                <div className="relative h-full w-full">
                    {stream ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="grid h-full place-items-center gap-2 px-4 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10">
                                    <VideoOff className="h-6 w-6 text-white/60" />
                                </div>
                                <div className="text-sm font-medium text-white">{participant.name}</div>
                                <div className="text-xs text-white/60">
                                    {isRemote ? "Waiting for video..." : "Camera is off"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Overlay */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                    {participant.cameraEnabled && (
                        <div className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                            CAM
                        </div>
                    )}
                </div>

                {/* Resize indicator */}
                <div className="pointer-events-none absolute bottom-0 right-0 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="h-3 w-3 border-b-2 border-r-2 border-white/40" />
                </div>
            </div>
        </Rnd>
    );
}
