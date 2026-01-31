import * as React from "react";
import { useAppStore } from "@/store/useAppStore";

type CameraStatus = "idle" | "requesting" | "granted" | "denied";

export function useCameraStream() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = React.useState<CameraStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const setLocalStream = useAppStore((s) => s.setLocalStream);
  const localStream = useAppStore((s) => s.localStream);
  const statusRef = React.useRef(status);

  // Keep ref in sync with state
  React.useEffect(() => {
    statusRef.current = status;
  }, [status]);

  React.useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const stop = React.useCallback(() => {
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("idle");
    setLocalStream(null);
  }, [setLocalStream]);

  const request = React.useCallback(async (deviceId?: string) => {
    setError(null);
    setStatus("requesting");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API missing. Secure context (HTTPS) required?");
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setLocalStream(stream);
      setStatus("granted");
      return stream;
    } catch (err: unknown) {
      console.error("Camera access failed:", err);
      const error = err as Error;
      setStatus("denied");

      let msg = "Camera access error.";
      let canRetry = false;
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        msg = "Camera permission denied. Click the camera icon in your browser's address bar to allow camera access, then refresh the page.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        msg = "No camera found. Please connect a camera and try again.";
        canRetry = true;
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        msg = "Camera is already in use by another application. Close other apps using the camera and try again.";
        canRetry = true;
      } else if (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError") {
        msg = "Camera doesn't support the requested settings. Trying with default settings...";
        canRetry = true;
      } else if (error.message) {
        msg = `${error.message}`;
        canRetry = true;
      }

      setError(msg);
      
      if (canRetry) {
        console.log('[Camera] Auto-retrying in 2 seconds...');
        setTimeout(() => {
          // Use ref to check current status
          if (statusRef.current === "denied") {
            request(deviceId);
          }
        }, 2000);
      }
      throw err;
    }
  }, [setLocalStream]);

  React.useEffect(() => {
    return () => stop();
  }, [stop]);

  return { videoRef, status, error, request, stop, stream: streamRef.current };
}
