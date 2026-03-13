const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
const PORT = 3000;

app.use(express.json());
app.use(express.text({
  type: "text/plain"   // ONLY parse text/plain as text
}));
app.use(express.static("Website"));

const crypto = require("crypto");
const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===================== SOCKET CONNECTION =====================

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", ({ roomCode, playerId }) => {
    const room = rooms[roomCode];
    if (!room) return;

    socket.join(roomCode);

    // 🔥 Attach socketId to the correct player
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.socketId = socket.id;
    }

    console.log(`Player ${playerId} joined room ${roomCode}`);

    io.to(roomCode).emit("room-update", room.players);
  });
  socket.on("typing", ({ userId, userName, typing }) => {
    console.log(`Received typing event from ${userId}: typing=${typing}`), { userName, typing };
    // broadcast to everyone in the room except sender
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id); // get rooms socket is in
    rooms.forEach(roomCode => {
      socket.to(roomCode).emit("typing", { userId, userName, typing });
    });
  });
  socket.on("message", ({ roomCode, userId, userName, message }) => {
    console.log(`Received message from ${userName} (${userId}) in room ${roomCode}: ${message}`);
    addMessage(roomCode, userId, userName, message);
    io.to(roomCode).emit("new-message", { userId, userName, message });
  });
  socket.on("restart-game", ({ roomCode, hostId }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== hostId) return;

    // Reset room state for a new round
    room.state = "playing";
    room.votes = {}; 
    room.word = null; // or pick a new word if needed

    // Notify everyone
    io.to(roomCode).emit("phase-changed", { state: "playing", restart: true });
  });
  socket.on("back-to-lobby", ({ roomCode, hostId }) => {
  const room = rooms[roomCode];
  if (!room) return;

  // Security: only host can trigger
  if (room.hostId !== hostId) return;

  // Reset only what you need
  room.state = "lobby";
  room.votes = {};

  // Send everyone back
  io.to(roomCode).emit("return-to-lobby");
});
  // server-side
    socket.on("next-phase", ({ roomCode, playerId, nextState }) => {
      const room = rooms[roomCode];
      if (!room) return;

      if (room.hostId !== playerId) return; // only host

      if (nextState) {
        room.state = nextState;
      } else {
        // normal flow
        if (room.state === "playing" && room.settings.votingEnabled) room.state = "voting";
        else if (room.state === "voting") room.state = "results";
        else if (room.state === "results") room.state = "ended";
      }

      io.to(roomCode).emit("phase-changed", { state: room.state });
    });
  socket.on("player-left", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;

    // Check if any imposters remain
    const impostersLeft = room.players.some(p => p.role === "imposter");

    if (!impostersLeft && room.hasImposters) {
      console.log("All imposters are gone!");
      io.to(roomCode).emit("all-imposters-gone");
    } else {
      console.log(`Imposters still in game: ${room.players.filter(p => p.role === "imposter").map(p => p.name).join(", ")}`);
    }
  });
  // ---------------- Voting ----------------
    socket.on("submit-vote", ({ roomCode, playerId, voteTarget }) => {
      const room = rooms[roomCode];
      if (!room || !room.settings.votingEnabled) return;

      room.votes[playerId] = voteTarget;

      // Notify host of current votes
      io.to(roomCode).emit("vote-update", {
        totalVotes: Object.keys(room.votes).length,
        totalPlayers: room.players.filter(p => p.playerPlaying).length
      });

      // DO NOT automatically advance to results!
      // Players just stay in voting until host triggers next-phase
    });
    socket.on("host-advance-results", ({ roomCode, playerId }) => {
      const room = rooms[roomCode];
      console.log("Host requested advancing to results for room:", roomCode, playerId);
      if (!room) return;

      // 🔒 Only host can trigger
      if (room.hostId !== playerId) return;

      const totalPlayers = room.players.filter(p => p.playerPlaying).length;
      const totalVotes = Object.keys(room.votes || {}).length;
      
      if (totalVotes === totalPlayers) {
        const voteCounts = {};

        for (const voteTarget of Object.values(room.votes)) {
          voteCounts[voteTarget] = (voteCounts[voteTarget] || 0) + 1;
        }

        const imposters = room.players.filter(p => p.role === "imposter");

        // Count votes
        const highestVotes = Math.max(...Object.values(voteCounts));
        const playersWithHighest = Object.entries(voteCounts)
          .filter(([_, count]) => count === highestVotes)
          .map(([id]) => id);

        // Check how many imposters were tied or eliminated
        const impostersWithHighestVotes = imposters.filter(i =>
          playersWithHighest.includes(i.id)
        );

        let resultType;
        if (imposters.length === 0) {
          resultType = "game-noImposter";
        } else {
          // Count votes
          const highestVotes = Math.max(...Object.values(voteCounts));
          const playersWithHighest = Object.entries(voteCounts)
            .filter(([_, count]) => count === highestVotes)
            .map(([id]) => id);

          // Check how many imposters were tied or eliminated
          const impostersWithHighestVotes = imposters.filter(i =>
            playersWithHighest.includes(i.id)
          );

          // 🟡 DRAW = tie and at least one imposter involved
          if (playersWithHighest.length > 1 && impostersWithHighestVotes.length > 0) {
            resultType = "draw";
          }
          // 🟢 PLAYERS WIN = ALL imposters eliminated
          else if (impostersWithHighestVotes.length === imposters.length) {
            resultType = "players-win";
          }
          // 🔴 IMPOSTERS WIN = at least one survives
          else {
            resultType = "imposter-win";
          }
        }

        room.state = "results";
        room.results = {
          resultType,
          imposters: imposters.map(i => ({
            name: i.name,
            hint: i.hint
          })),
          correctWord: room.word
        };
        io.to(roomCode).emit("phase-changed", {
          state: "results",
          results: room.results
        });
      } else {
        socket.emit("not-all-voted", {
          totalVotes,
          totalPlayers
        });
      }
    });
  socket.on("disconnect", () => {
  for (const roomCode of socket.rooms) {
    if (roomCode === socket.id) continue;

    const room = rooms[roomCode];
    if (!room) continue;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) continue;

    const playerId = player.id;

    // Give 2 seconds to reconnect (page transition case)
    setTimeout(() => {
      removePlayerProperly(roomCode, playerId);
    }, 2000);
  }
});
});
function removePlayerProperly(roomCode, playerId) {
  const room = rooms[roomCode];
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  if (!player) return;

  // 🔥 IMPORTANT:
  // If player has a NEW socketId, they reconnected — do nothing
  if (player.socketId) {
    const socketStillConnected = io.sockets.sockets.get(player.socketId);
    if (socketStillConnected) return;
  }

  // Remove player
  room.players = room.players.filter(p => p.id !== playerId);

  // Notify room
  io.to(roomCode).emit("room-update", room.players);

  // Cleanup empty room
  if (room.players.length === 0) {
    delete rooms[roomCode];
  }

  console.log(`Removed player ${playerId} from room ${roomCode}`);
}
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

  res.json({ roomCode, hostId ,name});
});

// Join Room
app.post("/api/join-room", (req, res) => {
  const { name, roomCode } = req.body;
  if (!rooms[roomCode]) return res.json({ error: "Room not found" });

  let uniqueName = name;
  const existingNames = rooms[roomCode].players.map(p => p.name);
  let counter = 1;

  // Keep appending a number until it's unique
  while (existingNames.includes(uniqueName)) {
    uniqueName = `${name} (${counter})`;
    counter++;
  }

  const playerId = crypto.randomUUID();
  rooms[roomCode].players.push({ id: playerId, name: uniqueName, playerPlaying: rooms[roomCode].state !== "voting" });

  // Notify everyone in room about new player
  io.to(roomCode).emit("room-update", rooms[roomCode].players);

  res.json({ success: true, playerId, uniqueName });
});

// Leave Room (non-host)
app.post("/api/leave-room", (req, res) => {
  let data = req.body;

  // If sendBeacon sent raw text, parse it
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (err) {
      return res.json({ error: "Invalid JSON" });
    }
  }

  const { roomCode, playerId } = data || {};

  if (!roomCode || !playerId || !rooms[roomCode]) {
    return res.json({ error: "Room not found" });
  }

  const room = rooms[roomCode];
  room.players = room.players.filter(p => p.id !== playerId);
  room.votes = {};
  console.log(`${playerId} has left the room`);

  io.to(roomCode).emit("room-update", room.players);
  io.to(roomCode).emit("vote-update", {
    totalVotes: Object.keys(room.votes).length,
    totalPlayers: room.players.length
  });

  if (room.players.length === 0) delete rooms[roomCode];

  res.json({ success: true });
});

// Close Room (host)
app.post("/api/close-room", (req, res) => {
  let data = req.body;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } 
    catch (err) { return res.json({ error: "Invalid JSON" }); }
  }

  const { roomCode, hostId } = data || {};
  if (!roomCode || !hostId || !rooms[roomCode]) return res.json({ error: "Room not found" });
  if (rooms[roomCode].hostId !== hostId) return res.json({ error: "Only host can close the room" });

  console.log("Host is closing the room");

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
  rooms[roomCode].messages = [];
  room.players.forEach(player => {
    player.playerPlaying = true;  // ✅ everyone is active again
  });
  const GenreManager = require("./Website/JS/genres.js");
  const genreManager = new GenreManager();
  // Settings from host
  let imposterCount = parseInt(settings.imposterCount) || 1;
  const randomImposters = settings.randomImposters || "No";
  const difficulty = (settings.difficulty || "medium").toLowerCase();
  const hintToggle = settings.hintToggle || "Yes";
  let genre = settings.genre || "General";
  if (genre === "Random") {
    const genres = genreManager.getGenres();
    genre = genres[Math.floor(Math.random() * genres.length)];
  } 
  if (randomImposters === "Yes") {
    const randomChance = Math.random(); // 0 → 1
    if (randomChance < settings.imposterChance || 0.2) { 
      imposterCount = 0;
      console.log("Random imposters test: No imposters this game!");
    }
  }
  room.hasImposters = imposterCount > 0;
  const votingEnabled = settings.voting || false;
  const chatEnabled = settings.chat || false;
  console.log("Chat enabled for this game:", chatEnabled, "Voting enabled for this game:", votingEnabled);
  room.settings.chatEnabled = chatEnabled;
  room.settings.votingEnabled = votingEnabled;

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

  room.state = "playing";
  room.votes = {};
  room.word = selectedWordObj.word;
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
  if (votingEnabled) {
    room.state = "voting";
    room.votes = {}; // reset votes
    // Emit phase change to everyone immediately
    io.to(roomCode).emit("phase-changed", { state: "voting" });
  }
  res.json({ success: true });
});
// Check if voting is enabled for this room
app.get("/api/check-voting", (req, res) => {
  const { roomCode } = req.query;
  if (!roomCode || !rooms[roomCode]) return res.json({ votingEnabled: false });

  const room = rooms[roomCode];
  res.json({ votingEnabled: room.settings.votingEnabled || false});
});
app.get("/api/check-chat", (req, res) => {
  const { roomCode } = req.query;
  if (!roomCode || !rooms[roomCode]) return res.json({ chatEnabled: false });

  const room = rooms[roomCode];
  res.json({ chatEnabled: room.settings.chatEnabled || false});
});

app.get("/api/get-results", (req, res) => {
  const { roomCode } = req.query;

  const room = rooms[roomCode];
  if (!room || !room.results) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    results: room.results
  });
});
// Get all players in a room
app.get("/api/players", (req, res) => {
  const { roomCode } = req.query;

  if (!roomCode || !rooms[roomCode]) {
    return res.json({ error: "Room not found" });
  }

  const room = rooms[roomCode];

  // Only send safe data (no roles, no words)
  const playerList = room.players.map(p => ({
    id: p.id,
    name: p.name
  }));

  res.json({ players: playerList });
});
// server.js
app.get("/api/current-game/:roomCode", (req, res) => {
    const { roomCode } = req.params;
    const room = rooms[roomCode];
    if (!room) return res.json({ error: "Room not found" });
    res.json({
        state: room.state,
        gameData: {
            word: room.word,
            players: room.players.map(p => ({
                id: p.id,
                role: p.role,
                word: p.word,
                hint: p.hint
            }))
        }
    });
});
app.post("/api/send-message", (req, res) => {

  const { roomCode, playerName, message, userId } = req.body;

  if (!roomCode || !playerName || !message || !userId) {
    return res.status(400).json({
      error: "Missing data",
      roomCode,
      playerName,
      message,
      userId
    });
  }

  addMessage(roomCode, userId, playerName, message);

  return res.json({ message: "Message sent" });

});
app.get("/api/get-votes", (req, res) => {
  const { roomCode } = req.query;
  if (!roomCode || !rooms[roomCode]) {
    return res.status(400).json({ error: "Room not found" });
  }

  const room = rooms[roomCode];
  res.json({ totalVotes: Object.keys(room.votes).length, totalPlayers: room.players.filter(p => p.playerPlaying).length});
});
app.get("/api/voted-player", (req, res) => {
  const { roomCode, userName } = req.query;
  if (!roomCode || !rooms[roomCode]) {
    return res.status(400).json({ error: "Room not found" });
  }
  const room = rooms[roomCode];
  const votedPlayerId = room.votes[userName];
  const votedPlayer = room.players.find(p => p.id === votedPlayerId);
  console.log("Current votes in room:", room.votes);
  res.json({ votedPlayerName: votedPlayer ? votedPlayer.name : null });
});
// Getting messages
app.get("/api/get-messages", (req, res) => {
  const { roomCode } = req.query;
  if (!roomCode) return res.status(400).json({ error: "Missing roomCode" });

  const messages = getMessages(roomCode);
  return res.json({ messages });
});
function addMessage(roomCode, userId, playerName, messageText) {

  if (!rooms[roomCode]) {
    rooms[roomCode] = { messages: [] };
  }

  console.log(`Adding message to room ${roomCode}: ${playerName}: ${messageText}`);

  rooms[roomCode].messages.push({
    userId: userId,
    name: playerName,
    text: messageText
  });
}
function getMessages(roomCode) {
  if (!rooms[roomCode]) return [];
  return rooms[roomCode].messages; // already ordered first-come, first-serve
}
// ===================== START SERVER =====================
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});