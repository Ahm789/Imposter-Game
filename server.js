const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
const PORT = 3000;

app.use(express.json());
app.use(express.static("Website"));

const crypto = require("crypto");
const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===================== SOCKET CONNECTION =====================
const roomSockets = {}; // roomCode => [socket.id]

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", ({ roomCode, playerId }) => {
    if (!roomSockets[roomCode]) roomSockets[roomCode] = [];
    roomSockets[roomCode].push(socket.id);
    socket.join(roomCode);
    console.log(`Player ${playerId} joined room ${roomCode}`);

    // Notify everyone in the room about current players
    if (rooms[roomCode]) {
      io.to(roomCode).emit("room-update", rooms[roomCode].players);
    }
  });

  socket.on("disconnecting", () => {
    // Remove socket from roomSockets
    for (const roomCode of socket.rooms) {
      if (roomSockets[roomCode]) {
        roomSockets[roomCode] = roomSockets[roomCode].filter(id => id !== socket.id);
      }
    }
  });
});

// ===================== REST ENDPOINTS =====================

// Create Room
app.post("/api/create-room", (req, res) => {
  const { name } = req.body;
  if (!name) return res.json({ error: "Name required" });

  const roomCode = generateRoomCode();
  const hostId = crypto.randomUUID();

  rooms[roomCode] = {
    hostId,
    players: [{ id: hostId, name }],
    settings: { imposters: 1}
  };

  res.json({ roomCode, hostId });
});

// Join Room
app.post("/api/join-room", (req, res) => {
  const { name, roomCode } = req.body;
  if (!rooms[roomCode]) return res.json({ error: "Room not found" });

  const playerId = crypto.randomUUID();
  rooms[roomCode].players.push({ id: playerId, name });

  // Notify everyone in room about new player
  io.to(roomCode).emit("room-update", rooms[roomCode].players);

  res.json({ success: true, playerId });
});

// Leave Room (non-host)
app.post("/api/leave-room", (req, res) => {
  const { roomCode, playerId } = req.body || {};
  if (!roomCode || !playerId || !rooms[roomCode]) return res.json({ error: "Room not found" });

  const room = rooms[roomCode];
  room.players = room.players.filter(p => p.id !== playerId);

  // Notify remaining players
  io.to(roomCode).emit("room-update", room.players);

  if (room.players.length === 0) delete rooms[roomCode];
  res.json({ success: true });
});

// Close Room (host)
app.post("/api/close-room", (req, res) => {
  const { roomCode, hostId } = req.body || {};
  if (!roomCode || !hostId || !rooms[roomCode]) return res.json({ error: "Room not found" });
  if (rooms[roomCode].hostId !== hostId) return res.json({ error: "Only host can close the room" });

  // Notify everyone in the room that the host closed it
  io.to(roomCode).emit("room-closed");

  delete rooms[roomCode];
  res.json({ success: true });
});

// Start Game
app.post("/api/start-game", (req, res) => {
  const { roomCode, hostId, settings } = req.body || {};

  if (!roomCode || !hostId || !rooms[roomCode]) return res.json({ error: "Room not found" });

  const room = rooms[roomCode];
  const { players } = room;
  const GenreManager = require("./Website/JS/genres.js");
  const genreManager = new GenreManager();
  // Settings from host
  const imposterCount = parseInt(settings.imposters) || 1;
  const randomImposters = settings.randomImposters || "No";
  const difficulty = (settings.difficulty || "medium").toLowerCase();
  const hintToggle = settings.hintToggle || "Yes";
  const genre = settings.genre || "General";

  // Use your genreManager (or similar) to get a random word
  const selectedWordObj = genreManager.getRandomWord(genre);

  // Determine imposters
  let rolesArray = new Array(players.length).fill("normal");
  let assigned = 0;

  while (assigned < imposterCount) {
    const idx = Math.floor(Math.random() * players.length);
    if (rolesArray[idx] === "normal") {
      rolesArray[idx] = "imposter";
      assigned++;
    }
  }

  // Assign words/hints to players
  room.players = players.map((p, i) => {
    if (rolesArray[i] === "imposter") {
      return {
        ...p,
        role: "imposter",
        hint: hintToggle === "Yes"
          ? genreManager.getHintWord(genre, selectedWordObj.word, difficulty)
          : null,
        word: null // imposters don’t get the actual word
      };
    } else {
      return {
        ...p,
        role: "normal",
        word: selectedWordObj.word,
        hint: null
      };
    }
  });

  // Emit game start to everyone in the room via Socket.IO
  io.to(roomCode).emit("game-started", {
    word: selectedWordObj.word,
    players: room.players.map(p => ({
      id: p.id,
      role: p.role,
      word: p.word,
      hint: p.hint
    }))
  });

  res.json({ success: true });
});
// ===================== START SERVER =====================
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});