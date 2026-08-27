"use client";

import { useEffect, useRef } from "react";

export default function Mediacomponent() {

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mediaRef = useRef(() => { });
    useEffect(() => {
        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        };
        startMedia();
        mediaRef.current = startMedia;
        return () => {
            const stream = videoRef.current?.srcObject;
            if (stream instanceof MediaStream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (

        <video ref={videoRef} autoPlay playsInline />

    );
};
