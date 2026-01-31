import { useEffect } from "react";

export function HttpsRedirect() {
    useEffect(() => {
        // Check if we are in a browser environment
        if (typeof window === "undefined") return;

        // Allow localhost/127.0.0.1 for development without SSL
        if (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
        ) {
            return;
        }

        // If protocol is http:, redirect to https:
        if (window.location.protocol === "http:") {
            window.location.href = window.location.href.replace("http:", "https:");
        }
    }, []);

    return null;
}
