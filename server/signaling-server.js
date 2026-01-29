const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Store rooms and participants
const rooms = new Map();

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        rooms: rooms.size,
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);

    // Join a room
    socket.on('join-room', ({ roomId, userId, userName }) => {
        console.log(`[${new Date().toISOString()}] ${userName} (${userId}) joining room: ${roomId}`);

        socket.join(roomId);
        socket.userId = userId;
        socket.userName = userName;
        socket.roomId = roomId;

        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
        }

        const room = rooms.get(roomId);

        // Get existing participants
        const existingParticipants = Array.from(room.values());

        // Add new participant to room
        room.set(userId, {
            userId,
            userName,
            socketId: socket.id,
            joinedAt: new Date().toISOString()
        });

        // Notify new user of existing participants
        socket.emit('existing-participants', existingParticipants);

        // Notify existing participants of new user
        socket.to(roomId).emit('user-joined', {
            userId,
            userName,
            socketId: socket.id
        });

        console.log(`[${new Date().toISOString()}] Room ${roomId} now has ${room.size} participants`);
    });

    // Relay WebRTC offer
    socket.on('offer', ({ to, from, offer }) => {
        console.log(`[${new Date().toISOString()}] Relaying offer from ${from} to ${to}`);
        io.to(to).emit('offer', { from, offer });
    });

    // Relay WebRTC answer
    socket.on('answer', ({ to, from, answer }) => {
        console.log(`[${new Date().toISOString()}] Relaying answer from ${from} to ${to}`);
        io.to(to).emit('answer', { from, answer });
    });

    // Relay ICE candidate
    socket.on('ice-candidate', ({ to, from, candidate }) => {
        console.log(`[${new Date().toISOString()}] Relaying ICE candidate from ${from} to ${to}`);
        io.to(to).emit('ice-candidate', { from, candidate });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}`);

        if (socket.roomId && socket.userId) {
            const room = rooms.get(socket.roomId);
            if (room) {
                room.delete(socket.userId);

                // Notify others in room
                socket.to(socket.roomId).emit('user-left', {
                    userId: socket.userId,
                    userName: socket.userName
                });

                // Clean up empty rooms
                if (room.size === 0) {
                    rooms.delete(socket.roomId);
                    console.log(`[${new Date().toISOString()}] Room ${socket.roomId} deleted (empty)`);
                } else {
                    console.log(`[${new Date().toISOString()}] Room ${socket.roomId} now has ${room.size} participants`);
                }
            }
        }
    });

    // Handle explicit leave
    socket.on('leave-room', () => {
        if (socket.roomId) {
            socket.leave(socket.roomId);

            const room = rooms.get(socket.roomId);
            if (room) {
                room.delete(socket.userId);

                socket.to(socket.roomId).emit('user-left', {
                    userId: socket.userId,
                    userName: socket.userName
                });

                if (room.size === 0) {
                    rooms.delete(socket.roomId);
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] Signaling server running on port ${PORT}`);
});
