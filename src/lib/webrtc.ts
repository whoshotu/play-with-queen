import { io, Socket } from 'socket.io-client';
import { ChatMessage, TruthOrDarePrompt } from './types';

// STUN servers for NAT traversal
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

export type WebRTCConfig = {
  signalingServerUrl: string;
  roomId: string;
  userId: string;
  userName: string;
};

export type PeerConnection = {
  connection: RTCPeerConnection;
  stream: MediaStream | null;
};

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export type DiceRollEvent = {
    roll: number[];
    userId: string;
    timestamp: number;
};

export type DiceConfigEvent = {
    config: any[];
    userId: string;
    timestamp: number;
};

export type TruthOrDareSelectEvent = {
    prompt: TruthOrDarePrompt;
    userId: string;
    timestamp: number;
};

export type TruthOrDareActionEvent = {
    action: 'skip' | 'forfeit' | 'complete';
    userId: string;
    timestamp: number;
};

export class WebRTCManager {
    private socket: Socket | null = null;
    private config: WebRTCConfig;
    private localStream: MediaStream | null = null;
    private peerConnections: Map<string, PeerConnection> = new Map();
    private onRemoteStream: ((userId: string, stream: MediaStream) => void) | null = null;
    private onRemoteStreamRemoved: ((userId: string) => void) | null = null;
    private onUserJoined: ((userId: string, userName: string) => void) | null = null;
    private onUserLeft: ((userId: string) => void) | null = null;
    private onConnectionStateChange: ((state: string) => void) | null = null;
    private onChatMessage: ((message: ChatMessage) => void) | null = null;
    private onDiceRoll: ((event: DiceRollEvent) => void) | null = null;
    private onDiceConfig: ((event: DiceConfigEvent) => void) | null = null;
    private onTruthOrDareSelect: ((event: TruthOrDareSelectEvent) => void) | null = null;
    private onTruthOrDareAction: ((event: TruthOrDareActionEvent) => void) | null = null;

    constructor(config: WebRTCConfig) {
        this.config = config;
    }

    // Connect to signaling server
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const isSecure = window.location.protocol === 'https:';
                let url = this.config.signalingServerUrl;
                
                // For HTTPS sites, we need to handle mixed content carefully
                if (isSecure && url.startsWith('http://')) {
                    console.warn('[WebRTC] Warning: Mixed content - connecting to HTTP signaling server from HTTPS page');
                    console.warn('[WebRTC] This may be blocked by the browser. Consider using HTTPS signaling server.');
                    
                    // Try polling first as fallback for mixed content scenarios
                    this.socket = io(url, {
                        transports: ['polling'], // Start with polling to avoid WebSocket mixed content
                        secure: false,
                        timeout: 10000,
                        forceNew: true,
                        upgrade: false, // Don't upgrade to WebSocket to avoid mixed content
                    });
                } else {
                    this.socket = io(url, {
                        transports: ['websocket', 'polling'],
                        secure: isSecure,
                        timeout: 10000,
                        forceNew: true,
                    });
                }

                this.socket.on('connect', () => {
                    console.log('[WebRTC] Connected to signaling server');
                    this.setupSignalingListeners();
                    this.joinRoom();
                    this.onConnectionStateChange?.('connected');
                    resolve();
                });

                this.socket.on('connect_error', (error) => {
                    console.error('[WebRTC] Connection error:', error);
                    this.onConnectionStateChange?.('error');
                    
                    // If mixed content blocked, try polling-only approach
                    if (isSecure && (error.message?.includes('blocked') || error.message?.includes('Mixed Content'))) {
                        console.log('[WebRTC] Mixed content blocked, trying polling-only connection...');
                        
                        // Destroy current socket and try polling only
                        if (this.socket) {
                            this.socket.disconnect();
                            this.socket = null;
                        }
                        
                        setTimeout(() => {
                            this.socket = io(url, {
                                transports: ['polling'],
                                secure: false,
                                timeout: 10000,
                                forceNew: true,
                                upgrade: false,
                            });
                            
                            this.socket.on('connect', () => {
                                console.log('[WebRTC] Connected via polling');
                                this.setupSignalingListeners();
                                this.joinRoom();
                                this.onConnectionStateChange?.('connected');
                                resolve();
                            });
                            
                            this.socket.on('connect_error', (pollError) => {
                                console.error('[WebRTC] Polling connection also failed:', pollError);
                                reject(new Error('Connection failed: Mixed content blocked and polling failed'));
                            });
                        }, 1000);
                        return;
                    }
                    
                    // Retry connection if it's a timeout or network error
                    if (error.message?.includes('timeout') || error.message?.includes('network')) {
                        console.log('[WebRTC] Retrying connection in 3 seconds...');
                        setTimeout(() => {
                            if (!this.socket?.connected) {
                                this.socket?.connect();
                            }
                        }, 3000);
                    }
                    
                    reject(error);
                });

                this.socket.on('disconnect', () => {
                    console.log('[WebRTC] Disconnected from signaling server');
                    this.onConnectionStateChange?.('disconnected');
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Set local media stream (camera or screen)
    setLocalStream(stream: MediaStream) {
        this.localStream = stream;

        // Replace tracks in existing peer connections
        this.peerConnections.forEach((pc) => {
            const videoTrack = stream.getVideoTracks()[0];
            const audioTrack = stream.getAudioTracks()[0];

            const senders = pc.connection.getSenders();

            if (videoTrack) {
                const videoSender = senders.find(s => s.track?.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(videoTrack);
                }
            }

            if (audioTrack) {
                const audioSender = senders.find(s => s.track?.kind === 'audio');
                if (audioSender) {
                    audioSender.replaceTrack(audioTrack);
                }
            }
        });
    }

    // Get local stream
    getLocalStream(): MediaStream | null {
        return this.localStream;
    }

    // Event handlers
    onRemoteStreamAdded(callback: (userId: string, stream: MediaStream) => void) {
        this.onRemoteStream = callback;
    }

    onRemoteStreamRemove(callback: (userId: string) => void) {
        this.onRemoteStreamRemoved = callback;
    }

    onParticipantJoined(callback: (userId: string, userName: string) => void) {
        this.onUserJoined = callback;
    }

    onParticipantLeft(callback: (userId: string) => void) {
        this.onUserLeft = callback;
    }

    onStateChange(callback: (state: string) => void) {
        this.onConnectionStateChange = callback;
    }

    onMessageReceived(callback: (message: ChatMessage) => void) {
        this.onChatMessage = callback;
    }

    onDiceRollReceived(callback: (event: DiceRollEvent) => void) {
        this.onDiceRoll = callback;
    }

    onDiceConfigReceived(callback: (event: DiceConfigEvent) => void) {
        this.onDiceConfig = callback;
    }

    onTruthOrDareSelectReceived(callback: (event: TruthOrDareSelectEvent) => void) {
        this.onTruthOrDareSelect = callback;
    }

    onTruthOrDareActionReceived(callback: (event: TruthOrDareActionEvent) => void) {
        this.onTruthOrDareAction = callback;
    }

    // Send a chat message or emoji reaction
    sendMessage(message: ChatMessage) {
        if (!this.socket) return;
        this.socket.emit('chat-message', {
            roomId: this.config.roomId,
            message: message
        });
    }

    // Send dice roll to all users in room
    sendDiceRoll(roll: number[]) {
        if (!this.socket) return;
        this.socket.emit('dice-roll', {
            roomId: this.config.roomId,
            roll,
            userId: this.config.userId,
        });
    }

    // Send dice configuration to all users in room
    sendDiceConfig(config: any[]) {
        if (!this.socket) return;
        this.socket.emit('dice-config', {
            roomId: this.config.roomId,
            config,
            userId: this.config.userId,
        });
    }

    // Send truth or dare selection to all users in room
    sendTruthOrDareSelect(prompt: TruthOrDarePrompt) {
        if (!this.socket) return;
        this.socket.emit('truth-or-dare-select', {
            roomId: this.config.roomId,
            prompt,
            userId: this.config.userId,
        });
    }

    // Send truth or dare action (skip, forfeit, complete) to all users in room
    sendTruthOrDareAction(action: 'skip' | 'forfeit' | 'complete', userId?: string) {
        if (!this.socket) return;
        this.socket.emit('truth-or-dare-action', {
            roomId: this.config.roomId,
            action,
            userId: userId || this.config.userId,
        });
    }

    // Join room
    private joinRoom() {
        if (!this.socket) return;

        this.socket.emit('join-room', {
            roomId: this.config.roomId,
            userId: this.config.userId,
            userName: this.config.userName,
        });
    }

    // Setup signaling event listeners
    private setupSignalingListeners() {
        if (!this.socket) return;

        // Existing participants in room
        this.socket.on('existing-participants', (participants: { userId: string, userName: string, socketId: string }[]) => {
            console.log('[WebRTC] Existing participants:', participants);
            participants.forEach((participant) => {
                this.createPeerConnection(participant.userId, participant.socketId, true);
            });
        });

        // New user joined
        this.socket.on('user-joined', ({ userId, userName, socketId }: { userId: string, userName: string, socketId: string }) => {
            console.log('[WebRTC] User joined:', userName);
            this.onUserJoined?.(userId, userName);
            this.createPeerConnection(userId, socketId, false);
        });

        // User left
        this.socket.on('user-left', ({ userId }: { userId: string }) => {
            console.log('[WebRTC] User left:', userId);
            this.closePeerConnection(userId);
            this.onUserLeft?.(userId);
            this.onRemoteStreamRemoved?.(userId);
        });

        // Received offer
        this.socket.on('offer', async ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {
            console.log('[WebRTC] Received offer from:', from);
            await this.handleOffer(from, offer);
        });

        // Received answer
        this.socket.on('answer', async ({ from, answer }: { from: string, answer: RTCSessionDescriptionInit }) => {
            console.log('[WebRTC] Received answer from:', from);
            await this.handleAnswer(from, answer);
        });

        // Received ICE candidate
        this.socket.on('ice-candidate', async ({ from, candidate }: { from: string, candidate: RTCIceCandidateInit }) => {
            console.log('[WebRTC] Received ICE candidate from:', from);
            await this.handleIceCandidate(from, candidate);
        });

        // Received chat message
        this.socket.on('chat-message', (message: ChatMessage) => {
            console.log('[WebRTC] Received chat message from:', message.senderName);
            this.onChatMessage?.(message);
        });

        // Received dice roll
        this.socket.on('dice-roll', (event: DiceRollEvent) => {
            console.log('[WebRTC] Received dice roll from:', event.userId, event.roll);
            this.onDiceRoll?.(event);
        });

        // Received dice config
        this.socket.on('dice-config', (event: DiceConfigEvent) => {
            console.log('[WebRTC] Received dice config from:', event.userId);
            this.onDiceConfig?.(event);
        });

        // Received truth or dare selection
        this.socket.on('truth-or-dare-select', (event: TruthOrDareSelectEvent) => {
            console.log('[WebRTC] Received truth or dare selection from:', event.userId);
            this.onTruthOrDareSelect?.(event);
        });

        // Received truth or dare action
        this.socket.on('truth-or-dare-action', (event: TruthOrDareActionEvent) => {
            console.log('[WebRTC] Received truth or dare action from:', event.userId, event.action);
            this.onTruthOrDareAction?.(event);
        });
    }

    // Create peer connection
    private createPeerConnection(userId: string, socketId: string, initiator: boolean) {
        if (this.peerConnections.has(userId)) {
            console.log('[WebRTC] Peer connection already exists for:', userId);
            return;
        }

        const pc = new RTCPeerConnection({ 
            iceServers: ICE_SERVERS,
            iceCandidatePoolSize: 10, // Pre-gather ICE candidates
            iceTransportPolicy: 'all' // Allow all ICE candidates
        });

        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                pc.addTrack(track, this.localStream!);
            });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && this.socket) {
                this.socket.emit('ice-candidate', {
                    to: socketId,
                    from: this.config.userId,
                    candidate: event.candidate,
                });
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('[WebRTC] Received remote track from:', userId);
            const [stream] = event.streams;
            const peerConn = this.peerConnections.get(userId);
            if (peerConn) {
                peerConn.stream = stream;
                this.onRemoteStream?.(userId, stream);
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log('[WebRTC] Connection state for', userId, ':', pc.connectionState);
            if (pc.connectionState === 'failed') {
                console.log('[WebRTC] Connection failed, attempting to restart ICE');
                pc.restartIce();
                // Restart connection after a delay if it's still failed
                setTimeout(() => {
                    if (pc.connectionState === 'failed') {
                        this.closePeerConnection(userId);
                        // Recreate connection
                        this.createPeerConnection(userId, socketId, initiator);
                    }
                }, 5000);
            } else if (pc.connectionState === 'closed') {
                this.closePeerConnection(userId);
            }
        };

        // Set connection timeout
        setTimeout(() => {
            if (pc.connectionState === 'connecting' || pc.connectionState === 'new') {
                console.log('[WebRTC] Connection timeout for', userId);
                this.closePeerConnection(userId);
            }
        }, 15000); // 15 second timeout

        this.peerConnections.set(userId, { connection: pc, stream: null });

        // If initiator, create and send offer
        if (initiator) {
            this.createOffer(userId, socketId);
        }
    }

    // Create and send offer
    private async createOffer(userId: string, socketId: string) {
        const peerConn = this.peerConnections.get(userId);
        if (!peerConn || !this.socket) return;

        try {
            const offer = await peerConn.connection.createOffer();
            await peerConn.connection.setLocalDescription(offer);

            this.socket.emit('offer', {
                to: socketId,
                from: this.config.userId,
                offer,
            });
        } catch (error) {
            console.error('[WebRTC] Error creating offer:', error);
        }
    }

    // Handle received offer
    private async handleOffer(fromUserId: string, offer: RTCSessionDescriptionInit) {
        let peerConn = this.peerConnections.get(fromUserId);

        // Create peer connection if it doesn't exist
        if (!peerConn) {
            // We need the socket ID, but we don't have it from the offer
            // The socket ID is embedded in the signaling, so we'll use fromUserId as socketId
            this.createPeerConnection(fromUserId, fromUserId, false);
            peerConn = this.peerConnections.get(fromUserId);
        }

        if (!peerConn || !this.socket) return;

        try {
            await peerConn.connection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConn.connection.createAnswer();
            await peerConn.connection.setLocalDescription(answer);

            this.socket.emit('answer', {
                to: fromUserId,
                from: this.config.userId,
                answer,
            });
        } catch (error) {
            console.error('[WebRTC] Error handling offer:', error);
        }
    }

    // Handle received answer
    private async handleAnswer(fromUserId: string, answer: RTCSessionDescriptionInit) {
        const peerConn = this.peerConnections.get(fromUserId);
        if (!peerConn) return;

        try {
            await peerConn.connection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('[WebRTC] Error handling answer:', error);
        }
    }

    // Handle received ICE candidate
    private async handleIceCandidate(fromUserId: string, candidate: RTCIceCandidateInit) {
        const peerConn = this.peerConnections.get(fromUserId);
        if (!peerConn) return;

        try {
            await peerConn.connection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('[WebRTC] Error adding ICE candidate:', error);
        }
    }

    // Close peer connection
    private closePeerConnection(userId: string) {
        const peerConn = this.peerConnections.get(userId);
        if (peerConn) {
            peerConn.connection.close();
            this.peerConnections.delete(userId);
        }
    }

    // Disconnect and cleanup
    disconnect() {
        // Close all peer connections
        this.peerConnections.forEach((pc, userId) => {
            this.closePeerConnection(userId);
        });

        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        // Disconnect socket
        if (this.socket) {
            this.socket.emit('leave-room');
            this.socket.disconnect();
            this.socket = null;
        }

        this.onConnectionStateChange?.('disconnected');
    }

    // Get all remote streams
    getRemoteStreams(): Map<string, MediaStream> {
        const streams = new Map<string, MediaStream>();
        this.peerConnections.forEach((pc, userId) => {
            if (pc.stream) {
                streams.set(userId, pc.stream);
            }
        });
        return streams;
    }
}
