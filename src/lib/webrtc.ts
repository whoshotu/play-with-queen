import { io, Socket } from 'socket.io-client';
import { ChatMessage } from './types';

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

    constructor(config: WebRTCConfig) {
        this.config = config;
    }

    // Connect to signaling server
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Force secure WebSocket (wss://) when on HTTPS
                const isSecure = window.location.protocol === 'https:';
                const url = isSecure && this.config.signalingServerUrl.startsWith('http://') 
                    ? this.config.signalingServerUrl.replace('http://', 'https://')
                    : this.config.signalingServerUrl;
                
                this.socket = io(url, {
                    transports: ['websocket', 'polling'],
                    secure: isSecure,
                    timeout: 10000, // 10 second connection timeout
                    forceNew: true,
                });

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

    // Send a chat message or emoji reaction
    sendMessage(message: ChatMessage) {
        if (!this.socket) return;
        this.socket.emit('chat-message', {
            roomId: this.config.roomId,
            message: message
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
