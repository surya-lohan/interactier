"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

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

    // Initialize position at bottom-right of viewport on client mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const initialX = Math.max(20, window.innerWidth - 310);
            const initialY = Math.max(70, window.innerHeight - 230);
            setPosition({ x: initialX, y: initialY });
        }
    }, []);

    // Pointer event handlers for fluid, lag-free dragging
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Only drag on primary (left) button click
        if (e.button !== 0) return;
        // Don't drag if user is clicking an interactive button (minimize, mute, etc.)
        if ((e.target as HTMLElement).closest("button")) return;

        isDraggingRef.current = true;
        dragOffsetRef.current = {
            x: e.clientX - (position?.x ?? 0),
            y: e.clientY - (position?.y ?? 0),
        };

        // Capture all pointer movements even if cursor leaves header during fast drag
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return;

        const currentWidth = containerRef.current?.offsetWidth || 288;
        const currentHeight = containerRef.current?.offsetHeight || 190;

        const rawX = e.clientX - dragOffsetRef.current.x;
        const rawY = e.clientY - dragOffsetRef.current.y;

        // Min Y is 60px so it cannot hide behind the 56px top fixed Navbar
        const maxX = Math.max(10, window.innerWidth - currentWidth - 10);
        const maxY = Math.max(60, window.innerHeight - currentHeight - 10);

        const clampedX = Math.min(Math.max(10, rawX), maxX);
        const clampedY = Math.min(Math.max(60, rawY), maxY);

        setPosition({ x: clampedX, y: clampedY });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        isDraggingRef.current = false;
        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // ignore if already released
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

        const socket = io('http://localhost:1234/signaling', {
            transports: ["websocket", "polling"],
        })

        const iceCandidatesQueue: RTCIceCandidateInit[] = [];
        let peerConnection: RTCPeerConnection | null = null;

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
                    socket.emit("ice-candidate", e.candidate);
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

                socket.on("user-joined", async () => {
                    if (!peerConnection) return;
                    if (peerConnection.signalingState !== "stable") return;
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    socket.emit("offer", offer);
                })

                socket.on("offer", async (offer) => {
                    if (!peerConnection) return;
                    if (peerConnection.signalingState !== "stable") return;
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

                    while (iceCandidatesQueue.length > 0) {
                        const candidate = iceCandidatesQueue.shift();
                        if (candidate) {
                            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                    }

                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    socket.emit("answer", answer);

                })

                socket.on("answer", async (answer) => {
                    if (!peerConnection) return;
                    if (peerConnection.signalingState !== "have-local-offer") return;
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

                    while (iceCandidatesQueue.length > 0) {
                        const candidate = iceCandidatesQueue.shift();
                        if (candidate) {
                            await
                                peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                    }
                });

                socket.on("ice-candidate", async (candidate) => {
                    if (peerConnection && peerConnection.remoteDescription) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    } else {
                        iceCandidatesQueue.push(candidate);
                    }
                })

                socket.on("user-left", () => {
                    setHasRemoteUser(false);
                    remoteStreamRef.current = null;
                    if (remoteVideoref.current) {
                        remoteVideoref.current.srcObject = null;
                    }
                    if (peerConnection) {
                        peerConnection.close();
                        if (streamRef.current) {
                            peerConnection = createPeerConnection(streamRef.current)
                        }
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
                <video
                    ref={attachStream}
                    autoPlay
                    playsInline
                    muted
                    className="hidden"
                />

                <video
                    ref={attachRemoteStream}
                    autoPlay
                    playsInline
                    className="hidden"
                />
                <div
                    ref={containerRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
                    className={`fixed z-40 flex items-center gap-2.5 px-3.5 py-2 bg-[#0B1326]/95 border border-slate-700/80 rounded-full shadow-2xl shadow-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none cursor-grab hover:border-[#8083FF]/60 transition-colors ${!position ? 'bottom-5 right-5' : ''}`}
                    title="Drag to reposition"
                >
                    {/* Grip Icon */}
                    <svg className="w-3 h-3 text-slate-500 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="8" cy="6" r="1.8" />
                        <circle cx="16" cy="6" r="1.8" />
                        <circle cx="8" cy="12" r="1.8" />
                        <circle cx="16" cy="12" r="1.8" />
                        <circle cx="8" cy="18" r="1.8" />
                        <circle cx="16" cy="18" r="1.8" />
                    </svg>

                    <span className="relative flex h-2.5 w-2.5 pointer-events-none">
                        {!isVideoOff && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isVideoOff ? 'bg-slate-500' : 'bg-emerald-400'}`}></span>
                    </span>
                    <span className="text-xs font-semibold text-slate-200 pointer-events-none select-none">Camera</span>

                    {/* Status Badges */}
                    {isMuted && (
                        <span className="p-1 rounded-full bg-rose-500/20 text-rose-400 pointer-events-none" title="Microphone muted">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                    )}

                    {/* Restore / Expand Button */}
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
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
                className="fixed inset-4 sm:inset-8 z-50 rounded-2xl bg-[#0B1326]/98 border border-slate-700/90 shadow-2xl shadow-black backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Fullscreen Header */}
                <div className="h-12 px-5 flex items-center justify-between border-b border-slate-800/80 bg-[#070D1E]/60">
                    <div className="flex items-center gap-2.5">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                        </span>
                        <span className="text-sm font-bold text-white tracking-wide">Live Feed</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Full Screen</span>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs"
                        title="Exit Fullscreen"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Close</span>
                    </button>
                </div>

                {/* Fullscreen Video Area: Side-by-Side when 2 users, single centered when solo */}
                <div className={`flex-1 w-full p-4 grid gap-4 bg-[#070D1E] overflow-hidden ${hasRemoteUser ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-4xl mx-auto"
                    }`}>
                    {/* User 1: You */}
                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
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
                        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
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
            className={`fixed z-40 w-64 sm:w-72 rounded-2xl overflow-hidden bg-[#0B1326]/95 border border-slate-700/80 shadow-2xl shadow-black/80 backdrop-blur-md flex flex-col group transition-colors hover:border-[#8083FF]/50 ${!position ? 'bottom-5 right-5' : ''}`}
        >
            {/* Header / Drag Handle Top Bar */}
            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="h-8 px-2.5 flex items-center justify-between bg-[#070D1E]/80 border-b border-slate-800/60 select-none active:cursor-grabbing hover:bg-[#0E172E] transition-colors"
                title="Drag to reposition anywhere"
            >
                <div className="flex items-center gap-1.5 pointer-events-none">
                    {/* Grip Icon */}
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="8" cy="6" r="1.8" />
                        <circle cx="16" cy="6" r="1.8" />
                        <circle cx="8" cy="12" r="1.8" />
                        <circle cx="16" cy="12" r="1.8" />
                        <circle cx="8" cy="18" r="1.8" />
                        <circle cx="16" cy="18" r="1.8" />
                    </svg>

                    <span className="relative flex h-2 w-2 ml-0.5">
                        {!isVideoOff && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isVideoOff ? 'bg-slate-500' : 'bg-emerald-400'}`}></span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300">You (Candidate)</span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Minimize Button */}
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="Minimize"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                        </svg>
                    </button>

                    {/* Fullscreen Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="Fullscreen"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Video Viewport Area */}
            <div className="relative aspect-video w-full bg-[#070D1E] overflow-hidden flex items-center justify-center">
                {/* 1. MAIN STAGE */}
                {hasRemoteUser ? (
                    // When caller is connected, caller takes main view
                    <video
                        ref={attachRemoteStream}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    // Solo mode: Your camera takes main view
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#070D1E]">
                                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sm font-bold text-slate-300">
                                    You
                                </div>
                                <span className="text-[10px] font-medium text-slate-400">Camera Off</span>
                            </div>
                        )}
                    </>
                )}

                {/* 2. INSET THUMBNAIL (Your camera floating in the corner when caller is present) */}
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
                            ? "bg-rose-500/30 border-rose-500/50 text-rose-300 hover:bg-rose-500/40"
                            : "bg-[#0B1326]/80 border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800"
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
                            ? "bg-rose-500/30 border-rose-500/50 text-rose-300 hover:bg-rose-500/40"
                            : "bg-[#0B1326]/80 border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800"
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
