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

    if (room.speakingOrder) {
      const currentSpeakerId = room.speakingOrder[room.currentSpeakerIndex];
      const currentSpeaker = room.players.find(p => p.id === currentSpeakerId);

      if (playerId === currentSpeakerId && currentSpeaker) {
        // First speaker joined → notify everyone
        io.to(roomCode).emit("current-speaker", {
          playerId: currentSpeaker.id,
          playerName: currentSpeaker.name,
          round: room.currentRound,
          totalRounds: room.settings.roundCount
        });
      }

      if (currentSpeaker) {
        // Send state to the joining player
        io.to(roomCode).emit("current-speaker", {
          playerId: currentSpeaker.id,
          playerName: currentSpeaker.name,
          round: room.currentRound,
          totalRounds: room.settings.roundCount
        });
      }
}
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
    
    const room = rooms[roomCode];
    const wordLimit = room.settings.wordLimit;
    if (!isValidWordCount(message, wordLimit)) {
      return socket.emit("chat-error", "Message does not meet word limit.");
    }
    if (room.currentRound && room.settings.roundCount !== "unlimited" && room.currentRound > room.settings.roundCount) {
      return socket.emit("chat-error", "Round limit reached. No more messages allowed.");
    }
    // 3️⃣ Check turn order (only if speakingOrder exists)
    if (room.speakingOrder) {
      const currentSpeaker = room.speakingOrder[room.currentSpeakerIndex];

      if (userId !== currentSpeaker) {
        return socket.emit("chat-error", "It's not your turn.");
      }

      // Move to next player
      room.currentSpeakerIndex++;

      // Check if we wrapped around to the first player
      if (room.currentSpeakerIndex >= room.speakingOrder.length) {
        room.currentSpeakerIndex = 0;
        room.currentRound = (room.currentRound || 1) + 1;

        // Now check if we reached the max round limit
        if (room.settings.roundCount !== "unlimited" && room.currentRound > room.settings.roundCount) {
          // Max rounds reached → emit round-end
          io.to(roomCode).emit("round-end", {
            round: room.currentRound - 1, // last round completed
            totalRounds: room.settings.roundCount
          });
          return; // stop further processing
        }
      }

      // Otherwise, emit the next speaker normally
      const nextSpeakerId = room.speakingOrder[room.currentSpeakerIndex];
      const nextSpeaker = room.players.find(p => p.id === nextSpeakerId);

      if (nextSpeaker) {
        io.to(roomCode).emit("current-speaker", {
          playerId: nextSpeaker.id,
          playerName: nextSpeaker.name,
          round: room.currentRound,
          totalRounds: room.settings.roundCount
        });
      }
    }

    addMessage(roomCode, userId, userName, message);
    io.to(roomCode).emit("new-message", { userId, userName, message });
  });
  function isValidWordCount(message, limit) {
    if (limit === "unlimited") return true;

    const words = countWords(message);

    // Range (ex: "2-3") → allow up to max words
    if (limit.includes("-")) {
      const [, max] = limit.split("-").map(Number);
      return words <= max;
    }

    // Exact value (ex: "1")
    return words === Number(limit);
  }
  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }
  socket.on("restart-game", ({ roomCode, hostId }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== hostId) return;

    // Reset room state for a new round
    room.state = "playing";
    room.votes = {}; 
    room.word = null; // or pick a new word if needed
    rooms[roomCode].lastActivity = Date.now();
    // Notify everyone
    io.to(roomCode).emit("phase-changed", { state: "playing", restart: true });
  });
  // When host wants to kick a player
  socket.on("kick-player", ({ roomCode, playerId }) => {
    const room = rooms[roomCode];
    if (!room || !room.players) return;

    // Remove player from room
    room.players = room.players.filter(p => p.id !== playerId);

    // Notify everyone in the room
    io.to(roomCode).emit("room-update", room.players);  // update all clients
    io.to(roomCode).emit("player-kicked", { kickedId: playerId });
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
      rooms[roomCode].lastActivity = Date.now();
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
        rooms[roomCode].lastActivity = Date.now();
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
    settings: { imposters: 1},
    lastActivity: Date.now()
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
  const wordLimit = settings.wordLimit || "unlimited";
  const timeLimit = settings.timeLimit || "unlimited";
  const roundCount = settings.roundCount || "unlimited";

  room.settings.wordLimit = wordLimit;
  room.settings.timeLimit = timeLimit;
  room.settings.chatEnabled = chatEnabled;
  room.settings.votingEnabled = votingEnabled;
  room.settings.roundCount = roundCount;
  room.currentTimer = null; // to keep track of the timeout

  // Create speaking order if timed rounds are enabled
  if (timeLimit !== "unlimited" || roundCount !== "unlimited") {
    const playerIds = players.map(p => p.id); // or p.socketId depending on your structure
    room.speakingOrder = shuffleArray(playerIds);
    room.currentSpeakerIndex = 0;
  } else {
    room.speakingOrder = null;
    room.currentSpeakerIndex = null;
  }
  room.currentRound = 1;

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
    rooms[roomCode].lastActivity = Date.now();
    io.to(roomCode).emit("phase-changed", { state: "voting" });
  }
  res.json({ success: true });
});
function shuffleArray(array) {
  const arr = [...array]; // copy
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
// Check if voting is enabled for this room
app.get("/api/check-voting", (req, res) => {
  const { roomCode } = req.query;
  if (!roomCode || !rooms[roomCode]) return res.json({ votingEnabled: false });

  const room = rooms[roomCode];
  res.json({ votingEnabled: room.settings.votingEnabled || false});
});
app.get("/api/check-chat", (req, res) => {
  const { roomCode } = req.query;
  if (!roomCode || !rooms[roomCode]) {
    return res.json({
      chatEnabled: false
    });
  }

  const room = rooms[roomCode];

  res.json({
    chatEnabled: room.settings.chatEnabled || false
  });
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
app.get("/api/active-rooms", (req, res) => {
  const now = Date.now();

  const activeRooms = Object.entries(rooms)
    .filter(([code, room]) => {
      const isActive = room.lastActivity && (now - room.lastActivity < 5 * 60 * 1000);
      const chatEnabled = room.public !== false; // exclude if chat explicitly false
      return isActive && chatEnabled;
    })
    .map(([code]) => code);

  res.json(activeRooms);
});
// POST /api/set-public
// Body: { roomCode: "ABCD", public: "Yes" or "No" }
app.post("/api/set-public", (req, res) => {
  const { roomCode, public } = req.body;
  if (!roomCode || typeof public === "undefined") {
    return res.status(400).json({ error: "Missing roomCode or public value" });
  }

  if (!rooms[roomCode]) {
    rooms[roomCode] = { messages: [], lastActivity: Date.now() };
  }

  rooms[roomCode].public = public === "Yes"; // store as boolean
  rooms[roomCode].lastActivity = Date.now(); // mark activity

  console.log(`Room ${roomCode} public set to: ${public}`);
  res.json({ success: true });
});
// ===================== START SERVER =====================
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});