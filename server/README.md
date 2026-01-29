   # Signaling Server

WebRTC signaling server for the Interactive Content Creator platform.

## Local Development

```bash
cd server
npm install
npm start
```

Server will run on `http://localhost:3001`

## Deployment to Render.com

1. Create account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (or use manual deploy)
4. Configure:
   - **Name:** `your-app-signaling-server`
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Plan:** Free
5. Click "Create Web Service"
6. Copy the URL (e.g., `https://your-app-signaling-server.onrender.com`)
7. Update client code with this URL

## Environment Variables

No environment variables required for basic setup.

## Health Check

GET `/health` - Returns `{ status: 'healthy' }`

## WebSocket Events

### Client → Server

- `join-room` - Join a video call room
- `offer` - Send WebRTC offer to peer
- `answer` - Send WebRTC answer to peer
- `ice-candidate` - Send ICE candidate to peer
- `leave-room` - Leave current room

### Server → Client

- `existing-participants` - List of participants already in room
- `user-joined` - New participant joined
- `user-left` - Participant left
- `offer` - WebRTC offer from peer
- `answer` - WebRTC answer from peer
- `ice-candidate` - ICE candidate from peer
