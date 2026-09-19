"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function Mediacomponent({ roomId }: { roomId: string }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoref = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const mediaRef = useRef(() => { });
    const pcRef = useRef<RTCPeerConnection | null>(null);

    const [isMinimized, setIsMinimized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [hasRemoteUser, setHasRemoteUser] = useState(false);
    // Draggable position state
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const dragDimensionsRef = useRef({ width: 288, height: 190 });
    const rafIdRef = useRef<number | null>(null);

    // Initialize position at bottom-right of viewport on client mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const initialX = Math.max(20, window.innerWidth - 310);
            const initialY = Math.max(70, window.innerHeight - 230);
            setPosition({ x: initialX, y: initialY });
        }
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        // Don't drag if user is clicking an interactive button (minimize, mute, etc.)
        if ((e.target as HTMLElement).closest("button")) return;

        isDraggingRef.current = true;
        const rect = containerRef.current?.getBoundingClientRect();
        const curX = rect ? rect.left : (position?.x ?? 0);
        const curY = rect ? rect.top : (position?.y ?? 0);

        dragOffsetRef.current = {
            x: e.clientX - curX,
            y: e.clientY - curY,
        };

        if (containerRef.current) {
            // Cache dimensions once at drag start to eliminate layout thrashing
            dragDimensionsRef.current = {
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            };
            // Disable any CSS transition immediately so dragging doesn't rubber-band
            containerRef.current.style.transition = "none";
            containerRef.current.style.willChange = "left, top";
        }

        // Capture all pointer movements even if cursor leaves header during fast drag
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return;

        const { width, height } = dragDimensionsRef.current;
        const rawX = e.clientX - dragOffsetRef.current.x;
        const rawY = e.clientY - dragOffsetRef.current.y;

        // Min Y is 60px so it cannot hide behind the 56px top fixed Navbar
        const maxX = Math.max(10, window.innerWidth - width - 10);
        const maxY = Math.max(60, window.innerHeight - height - 10);

        const clampedX = Math.min(Math.max(10, rawX), maxX);
        const clampedY = Math.min(Math.max(60, rawY), maxY);

        // Cancel any pending rAF to prevent event buildup
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
        }

        // Direct DOM update via requestAnimationFrame for 120fps butter-smooth movement
        rafIdRef.current = requestAnimationFrame(() => {
            if (containerRef.current) {
                containerRef.current.style.left = `${clampedX}px`;
                containerRef.current.style.top = `${clampedY}px`;
            }
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;

        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }

        if (containerRef.current) {
            containerRef.current.style.transition = "";
            containerRef.current.style.willChange = "auto";
            const rect = containerRef.current.getBoundingClientRect();
            setPosition({ x: rect.left, y: rect.top });
        }

        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
        }
    };

    // Keep stream attached whenever video element mounts or state toggles
    const attachStream = (element: HTMLVideoElement | null) => {
        videoRef.current = element;
        if (element && streamRef.current && element.srcObject !== streamRef.current) {
            element.srcObject = streamRef.current;
        }
    };

    const attachRemoteStream = (element: HTMLVideoElement | null) => {
        remoteVideoref.current = element;
        if (element && remoteStreamRef.current && element.srcObject !== remoteStreamRef.current) {
            element.srcObject = remoteStreamRef.current;
        }
        element?.play().catch((err) => {
            console.warn("Autoplay was blocked, will play on user interaction: ", err);
        })
    }

    useEffect(() => {

        const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/signaling`, {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            randomizationFactor: 0.5,
        })


        let peerConnection: RTCPeerConnection | null = null;
        let iceRestartTimer: string | number | NodeJS.Timeout | undefined = undefined;
        let isPolite = false;
        let makingOffer = false;
        let ignoreOffer = false;

        socket.on("room-full", () => {
            console.warn("room is full!")
            socket.disconnect();
            window.location.href = "/dashboard"
        })

        const createPeerConnection = (localStream: MediaStream) => {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            })

            localStream.getTracks().forEach((track) => {
                pc.addTrack(track, localStream);
            })

            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit("signal", { candidate: e.candidate })
                }

            }

            pc.ontrack = (e) => {
                if (e.streams && e.streams[0]) {
                    remoteStreamRef.current = e.streams[0];
                } else {
                    if (!remoteStreamRef.current) {
                        remoteStreamRef.current = new MediaStream();
                    }
                    remoteStreamRef.current.addTrack(e.track);
                }
                if (remoteVideoref.current) {
                    remoteVideoref.current.srcObject = remoteStreamRef.current;
                    remoteVideoref.current.play().catch(() => { })
                }
                setHasRemoteUser(true);
            }

            pc.oniceconnectionstatechange = () => {
                const state = pc.iceConnectionState;

                if (state === "disconnected") {
                    iceRestartTimer = setTimeout(() => {
                        if (pc.iceConnectionState === "disconnected") {
                            pc.restartIce();
                        }
                    }, 3000)
                } else if (state === "failed") {
                    clearTimeout(iceRestartTimer);
                    pc.restartIce();
                } else if (state === "connected") {
                    clearTimeout(iceRestartTimer);
                }
            }

            pc.onnegotiationneeded = async () => {
                try {
                    makingOffer = true;

                    await pc.setLocalDescription();

                    socket.emit("signal", { description: pc.localDescription })
                } catch (error) {
                    console.error("Negotiation error", error)
                } finally {
                    makingOffer = false;
                }

            }

            pcRef.current = pc;
            return pc;
        }

        const startMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                peerConnection = createPeerConnection(stream);

                socket.on("signal", async ({ senderId, description, candidate }) => {
                    try {
                        const pc = pcRef.current;

                        if (!pc) {
                            return;
                        }

                        if (senderId && socket.id) {
                            isPolite = socket.id < senderId;
                        }

                        if (description) {
                            const offerCollision = description.type === "offer" && (makingOffer || pc.signalingState !== "stable");

                            ignoreOffer = !isPolite && offerCollision;

                            if (ignoreOffer) {
                                return;
                            }

                            if (offerCollision) {
                                await pc.setLocalDescription({
                                    type: "rollback"
                                })
                            }

                            await pc.setRemoteDescription(description);

                            if (description.type === "offer") {
                                await pc.setLocalDescription();
                                socket.emit("signal", { description: pc.localDescription })
                            }
                        } else if (candidate) {
                            try {
                                await pc.addIceCandidate(candidate);
                            } catch (error) {
                                if (!ignoreOffer) {
                                    throw error
                                }
                            }
                        }
                    } catch (error) {
                        console.log("Signaling error", error)
                    }
                })

                socket.io.on("reconnect", () => {
                    socket.emit("join-room", roomId)
                })

                socket.on("user-joined", () => {
                    if (pcRef.current?.localDescription) {
                        socket.emit("signal", { description: pcRef.current.localDescription })
                    }
                    if (streamRef.current) {
                        if (peerConnection) {
                            peerConnection.close();
                        }
                        peerConnection = createPeerConnection(streamRef.current);
                    }
                });

                socket.on("user-left", () => {
                    setHasRemoteUser(false);
                    remoteStreamRef.current = null;
                    if (remoteVideoref.current) {
                        remoteVideoref.current.srcObject = null;
                    }
                    if (peerConnection) {
                        peerConnection.close();
                        peerConnection = null;
                        pcRef.current = null;
                    }
                })

                socket.emit("ready");

            } catch (error) {
                console.error("Error accessing media devices:", error);
            }
        };

        socket.emit("join-room", roomId);

        socket.on("room-joined", () => {
            startMedia();
        })

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }
            socket.disconnect();
        };
    }, [roomId]);

    // Sync fullscreen 
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsExpanded(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleMic = () => {
        const stream = videoRef.current?.srcObject;
        if (stream instanceof MediaStream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream instanceof MediaStream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const toggleFullscreen = () => {
        if (!isExpanded) {
            if (containerRef.current?.requestFullscreen) {
                containerRef.current.requestFullscreen().catch(() => {
                    setIsExpanded(true);
                });
            } else {
                setIsExpanded(true);
            }
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
            setIsExpanded(false);
        }
    };

    const togglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (videoRef.current && document.pictureInPictureEnabled) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (err) {
            console.error("PiP toggle error:", err);
        }
    };

    if (isMinimized) {
        return (
            <>
                {/* Hidden persistent video to keep stream active in DOM */}
                <video ref={attachStream} autoPlay playsInline muted className="hidden" />
                <video ref={attachRemoteStream} autoPlay playsInline className="hidden" />

                <div
                    ref={containerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
                    className={`fixed z-40 flex items-center gap-2.5 px-3.5 py-2 bg-white/95 dark:bg-[#0E172E]/95 border border-[#E2E8F0] dark:border-[#1E293B] rounded-full shadow-diffuse dark:shadow-none backdrop-blur-md select-none cursor-grab active:cursor-grabbing hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition-[border-color,box-shadow] duration-150 touch-none ${!position ? 'bottom-5 right-5' : ''}`}
                    title="Drag to reposition"
                >
                    {/* Grip Icon */}
                    <svg className="w-3 h-3 text-[#94A3B8] pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="8" cy="6" r="1.8" />
                        <circle cx="16" cy="6" r="1.8" />
                        <circle cx="8" cy="12" r="1.8" />
                        <circle cx="16" cy="12" r="1.8" />
                        <circle cx="8" cy="18" r="1.8" />
                        <circle cx="16" cy="18" r="1.8" />
                    </svg>

                    <span className="relative flex h-2.5 w-2.5 pointer-events-none">
                        {!isVideoOff && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isVideoOff ? 'bg-slate-400' : 'bg-[#10B981]'}`}></span>
                    </span>
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-white pointer-events-none select-none">Camera</span>

                    {/* Status Badges */}
                    {isMuted && (
                        <span className="p-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 pointer-events-none border border-rose-200 dark:border-rose-800" title="Microphone muted">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                    )}

                    {/* Restore / Expand Button */}
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="p-1 text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-full transition cursor-pointer"
                        title="Restore Video"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </>
        );
    }

    // 2. EXPANDED / FULLSCREEN SCENARIO
    if (isExpanded) {
        return (
            <div
                ref={containerRef}
                className="fixed inset-4 sm:inset-8 z-50 rounded-2xl bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Fullscreen Header */}
                <div className="h-12 px-5 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0B1326]">
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
                        </span>
                        <span className="text-sm font-bold text-[#0F172A] dark:text-white tracking-wide">Live Feed</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] font-semibold border border-[#BFDBFE] dark:border-slate-700">Full Screen</span>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-lg text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E2E8F0] dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                        title="Exit Fullscreen"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Close</span>
                    </button>
                </div>

                {/* Fullscreen Video Area: Side-by-Side when 2 users, single centered when solo */}
                <div className={`flex-1 w-full p-4 grid gap-4 bg-[#FAFAFC] dark:bg-[#070D1E] overflow-hidden ${hasRemoteUser ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-4xl mx-auto"
                    }`}>
                    {/* User 1: You */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center shadow-md">
                        <video
                            ref={attachStream}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? "hidden" : "block"}`}
                        />
                        {isVideoOff && (
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl font-bold text-slate-300">
                                    You
                                </div>
                                <span className="text-sm font-medium">Camera is turned off</span>
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-semibold text-white">
                            You (Candidate)
                        </div>
                    </div>

                    {/* User 2: Remote Peer (Only rendered if connected) */}
                    {hasRemoteUser && (
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 flex items-center justify-center shadow-md">
                            <video
                                ref={attachRemoteStream}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-semibold text-white">
                                Peer
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 3. DEFAULT FLOATING PIP SCENARIO (Draggable floating overlay)
    return (
        <div
            ref={containerRef}
            style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
            className={`fixed z-40 w-64 sm:w-72 rounded-2xl overflow-hidden bg-white dark:bg-[#0E172E] border border-[#E2E8F0] dark:border-[#1E293B] shadow-diffuse dark:shadow-none flex flex-col group hover:border-[#2563EB] dark:hover:border-[#3B82F6] transition-[border-color,box-shadow] duration-150 touch-none ${!position ? 'bottom-5 right-5' : ''}`}
        >
            {/* Header / Drag Handle Top Bar */}
            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="h-8 px-2.5 flex items-center justify-between bg-[#F8FAFC] dark:bg-[#0B1326] border-b border-[#E2E8F0] dark:border-[#1E293B] select-none cursor-grab active:cursor-grabbing hover:bg-[#F1F5F9] dark:hover:bg-[#15203D] transition-colors touch-none"
                title="Drag to reposition anywhere"
            >
                <div className="flex items-center gap-1.5 pointer-events-none">
                    {/* Grip Icon */}
                    <svg className="w-3.5 h-3.5 text-[#94A3B8]" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="8" cy="6" r="1.8" />
                        <circle cx="16" cy="6" r="1.8" />
                        <circle cx="8" cy="12" r="1.8" />
                        <circle cx="16" cy="12" r="1.8" />
                        <circle cx="8" cy="18" r="1.8" />
                        <circle cx="16" cy="18" r="1.8" />
                    </svg>

                    <span className="relative flex h-2 w-2 ml-0.5">
                        {!isVideoOff && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isVideoOff ? 'bg-slate-400' : 'bg-[#10B981]'}`}></span>
                    </span>
                    <span className="text-[11px] font-semibold text-[#0F172A] dark:text-white">You (Candidate)</span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Minimize Button */}
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1 rounded text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E2E8F0] dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Minimize"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                    </button>

                    {/* Fullscreen Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-1 rounded text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-[#E2E8F0] dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Fullscreen"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Video Viewport Area */}
            <div className="relative aspect-video w-full bg-[#0F172A] overflow-hidden flex items-center justify-center">
                {/* 1. MAIN STAGE */}
                {hasRemoteUser ? (
                    <video
                        ref={attachRemoteStream}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <>
                        <video
                            ref={attachStream}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-200 ${isVideoOff ? "opacity-0" : "opacity-100"
                                }`}
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#0F172A]">
                                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sm font-bold text-slate-300">
                                    You
                                </div>
                                <span className="text-[10px] font-medium text-slate-400">Camera Off</span>
                            </div>
                        )}
                    </>
                )}

                {/* 2. INSET THUMBNAIL */}
                {hasRemoteUser && (
                    <div className="absolute bottom-10 right-2 w-20 h-14 rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-black/80 z-10">
                        <video
                            ref={attachStream}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover scale-x-[-1] ${isVideoOff ? "hidden" : "block"}`}
                        />
                        {isVideoOff && (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-[10px] text-slate-400 font-semibold">
                                Off
                            </div>
                        )}
                        <span className="absolute bottom-0.5 left-1 text-[8px] bg-black/70 px-1 rounded text-white font-medium">
                            You
                        </span>
                    </div>
                )}

                {/* Browser Native PiP Button */}
                <button
                    onClick={togglePiP}
                    className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 hover:bg-black/80 backdrop-blur-xs border border-white/10 text-[10px] font-medium text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 opacity-0 group-hover:opacity-100 z-20"
                    title="Pop out in Picture-in-Picture window"
                >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>PiP</span>
                </button>

                {/* Floating Bottom Controls Toolbar */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity z-20">
                    <button
                        onClick={toggleMic}
                        className={`p-1.5 rounded-lg border backdrop-blur-md transition cursor-pointer flex items-center justify-center shadow-md ${isMuted
                            ? "bg-rose-500 border-rose-600 text-white"
                            : "bg-white/95 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                        title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            {isMuted && <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
                        </svg>
                    </button>

                    <button
                        onClick={toggleCamera}
                        className={`p-1.5 rounded-lg border backdrop-blur-md transition cursor-pointer flex items-center justify-center shadow-md ${isVideoOff
                            ? "bg-rose-500 border-rose-600 text-white"
                            : "bg-white/95 dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                        title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            {isVideoOff && <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
