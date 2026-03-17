window.addEventListener("DOMContentLoaded", () => {
  const hstroomCode = sessionStorage.getItem("roomCode");
  const proomCode = localStorage.getItem("proomCode");
  const roomCode = hstroomCode || proomCode;
  if (roomCode == null){
    window.location.href = "index.html";
  }
  window.addEventListener("pagehide", function () {
    const isInternalNav = sessionStorage.getItem("internalNavigation");
    // If this is internal navigation, don't leave room
    if (isInternalNav === "true") {
      sessionStorage.removeItem("internalNavigation");
      return;
    }
    // Immediately block backward navigation

    const hstroomCode = sessionStorage.getItem("roomCode");
    const proomCode = localStorage.getItem("proomCode");
    const roomCode = hstroomCode || proomCode;

    const hostId = localStorage.getItem("hostId");
    const playerId = localStorage.getItem("playerId");
    const userId = hostId || playerId;
    document.getElementById("lobbyBtn").style.display = "none";

    if (roomCode && playerId) {
      navigator.sendBeacon(
        "/api/leave-room",
        JSON.stringify({ roomCode, playerId: userId })
      );

      localStorage.removeItem("playerId");
      localStorage.removeItem("proomCode");
      localStorage.removeItem("playerName");
      localStorage.setItem("onlineMode", false);
      window.location.replace("join.html");
    } else if (roomCode && hostId) {
      navigator.sendBeacon(
        "/api/close-room",
        JSON.stringify({ roomCode, hostId })
      );

      localStorage.removeItem("hostId");
      sessionStorage.removeItem("roomCode");
      localStorage.removeItem("hostName");
      localStorage.setItem("onlineMode", false);

      window.location.replace("index.html");
    }
  });
});
const socket = io(); // connect to server
window.addEventListener("load", async () => {
  const titleSection = document.querySelector(".title-section");
  const computedStyle = window.getComputedStyle(titleSection);
  const currentMargin = parseInt(computedStyle.marginTop, 10); // e.g., 60
  titleSection.style.marginTop = (currentMargin - 60) + "px"; // reduce by 50px
  const hstroomCode = sessionStorage.getItem("roomCode");
  const proomCode = localStorage.getItem("proomCode");
  const roomCode = hstroomCode || proomCode;
  const playerName = localStorage.getItem("playerName");
  const hostName = localStorage.getItem("hostName");

  const userName = hostName || playerName;
  const hostId = localStorage.getItem("hostId");
  const playerId = localStorage.getItem("playerId");
  const userId = hostId || playerId;
  console.log("Room code:", roomCode);
  document.getElementById("backBtn").addEventListener("click", () => {
    sessionStorage.setItem("internalNavigation", "true");
    window.location.href = "voting.html";
  });
  loadmessages(roomCode, userId);
  socket.on("return-to-lobby", () => {
    if (hostId){
      sessionStorage.setItem("internalNavigation", "true");
      window.location.href = "game.html";
    }
    else{
      sessionStorage.setItem("errorMsg", "The host ended the game");
      sessionStorage.setItem("internalNavigation", "true");
      window.location.href = "lobby.html";
    }
  });
  socket.on("room-closed", () => {
      sessionStorage.setItem("errorMsg", "The host closed the game");
      sessionStorage.setItem("internalNavigation", "true");
      localStorage.removeItem("playerId");
      localStorage.removeItem("proomCode");
      localStorage.removeItem("playerName");
      localStorage.setItem("onlineMode", false);
      window.location.href = "join.html";
  });

  socket.on("all-imposters-gone", () => {
    // e.g., end the game or assign new imposters
    sessionStorage.setItem("errorMsg", "Imposter left the game");
    if (hostId){
      sessionStorage.setItem("internalNavigation", "true");
      window.location.href = "game.html";
    }
    else{
      sessionStorage.setItem("internalNavigation", "true");
      window.location.href = "lobby.html";
    }
  });
  socket.on("phase-changed", ({ state }) => {
    if (state === "results") {
      if (userId === hostId) {
        sessionStorage.setItem("internalNavigation", "true");
        window.location.href = "end.html";
      }
      sessionStorage.setItem("internalNavigation", "true");
      window.location.href = "end.html";
    }
  });
});
const playerColors = [
  "#e74c3c", "#3498db", "#2ecc71",
  "#f1c40f", "#9b59b6", "#1abc9c",
  "#e67e22", "#ff66cc"
];

const userColorMap = {};
let colorIndex = 0;
async function loadmessages(roomCode, userId) {
   try {
    const res = await fetch(`/api/get-messages?roomCode=${roomCode}&userId=${userId}`);
    const data = await res.json();
    console.log("Messages in room:", data.messages);
    const chatContainer = document.getElementById("chatMessages");
    chatContainer.innerHTML = ""; // clear old messages
    
    data.messages.forEach(msg => {

    const isSelf = msg.userId === userId;

    let playerColor;

    if (isSelf) {
      // Always green for the current user
      playerColor = "#2ecc71";
    } else {
      // Assign color to other players
      if (!userColorMap[msg.userId]) {
        userColorMap[msg.userId] = playerColors[colorIndex % playerColors.length];
        colorIndex++;
      }
      playerColor = userColorMap[msg.userId];
    }

    const messageHTML = `
      <div class="chat-message ${isSelf ? "self" : "other"}">
          <div class="player-name" style="color:${playerColor}">
              ${isSelf ? "You" : msg.name}
          </div>
          <div class="message-bubble" style="border-color:${playerColor}">
              ${msg.text}
          </div>
      </div>
    `;

    chatContainer.insertAdjacentHTML("beforeend", messageHTML);

  });

    // scroll to newest message
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } catch (err) {
      console.error("Failed to get messages:", err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const userName = localStorage.getItem("hostName") || localStorage.getItem("playerName");
  const roomCode = localStorage.getItem("proomCode") || sessionStorage.getItem("roomCode");
  const userId = localStorage.getItem("hostId") || localStorage.getItem("playerId");
  const messageInput = document.getElementById("chatInput");

  let isTyping = false;

  // Trigger when the user types something
  messageInput.addEventListener("input", () => {
    if (messageInput.value.trim().length > 0) {
      isTyping = true;
      console.log("User is typing...");
      // Optionally, emit a "typing" event to other players
      socket.emit("typing", { userId, userName, typing: true });
    } else {
      isTyping = false;
      console.log("User stopped typing");
      socket.emit("typing", { userId, userName, typing: false });
    }
  });

  // Also, detect when the user presses Enter to send a message
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && messageInput.value.trim().length > 0) {
      const message = messageInput.value.trim();
      socket.emit("message", { roomCode, userId, userName, message });
      messageInput.value = "";
      isTyping = false;
      socket.emit("typing", { userId, userName, typing: false });
    }
  });

  socket.emit("join-room", { roomCode, playerId: userId });

  socket.on("chat-error", (error) => {
          document.getElementById("error").style.display = "block";
          document.getElementById("errorMsg").textContent = error;
          setTimeout(() => {
          document.getElementById("error").style.display = "none";
        }, 3000); // 3000ms = 3 seconds
          return;
  });
  // Listen for timer updates from the server
  socket.on("timer-update", ({ playerId: currentPlayerId, remainingTime }) => {
    const timerEl = document.getElementById("Timer");


    timerEl.style.display = "block";

    // Format the time nicely (MM:SS)
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    timerEl.textContent = `Time left: ${minutes}:${seconds.toString().padStart(2, "0")}`;
    if (remainingTime <= 0) {
      timerEl.style.display = "none"; // hide timer when time's up 
    }

    // Optional: highlight if it's the current user’s turn
    if (currentPlayerId === userId) {
      timerEl.style.color = "red"; // your turn
    } else {
      timerEl.style.color = "green"; // someone else
    }
  });
  // Grab the element
  const playerTurnEl = document.getElementById("PlayerTurn");

  // Show current speaker
  socket.on("current-speaker", ({ round, totalRounds, playerName }) => {
    if (!round || !playerName) return;
    document.getElementById("PlayerName").style.display = "block";
    document.getElementById("PlayerName").textContent = "You are" + ": " + userName;
    let roundText;
    if (totalRounds === "unlimited") {
      roundText = `🎲 Round ${round} | 🎤 ${playerName}'s turn`;
    } else {
      roundText = `🎲 Round ${round}/${totalRounds} | 🎤 ${playerName}'s turn`;
    }

    playerTurnEl.textContent = roundText;

    // Show the element if hidden
    if (playerTurnEl.style.display === "none") {
      playerTurnEl.style.display = "block";
    }
  });

  // Show round end
  socket.on("round-end", () => {
    console.log("Round ended");
    playerTurnEl.style.display = "block";
    playerTurnEl.textContent = `🏁 Round over!`;
  });

  const typingUsers = new Map(); // userId -> userName

  socket.on("typing", ({ userId: typingUserId, userName, typing }) => {
    console.log(`Received typing event from user ${typingUserId}: typing=${typing}`, { userName, typing });

    if (typing) {
      typingUsers.set(typingUserId, {
        name: typingUserId === userId ? "You" : userName,
        id: typingUserId
      });
    } else {
      typingUsers.delete(typingUserId);
    }

    const indicator = document.getElementById("typingIndicator");
    const nameEl = document.querySelector(".typing-name");

    if (typingUsers.size > 0) {
      indicator.classList.remove("hidden");

      const namesHTML = Array.from(typingUsers.values()).map(user => {

        let color;

        if (user.id === userId) {
          color = "#2ecc71"; // Always green for self
        } else {
          if (!userColorMap[user.id]) {
            userColorMap[user.id] = playerColors[colorIndex % playerColors.length];
            colorIndex++;
          }
          color = userColorMap[user.id];
        }

        return `<span style="color:${color}">${user.name}</span>`;
      });

      nameEl.innerHTML = namesHTML.join(" & ") + " typing...";
    } else {
      indicator.classList.add("hidden");
    }
  });
  document.getElementById("sendBtn").addEventListener("click", async () => {
    const message = messageInput.value.trim();

    if (!message) return; // prevent empty messages

    console.log("Sending message:", message,roomCode, userId, userName);
    socket.emit("message", { roomCode, userId, userName, message });
    messageInput.value = "";
    isTyping = false;
    socket.emit("typing", { userId, userName, typing: false });
  });
  socket.on("new-message", (msg) => {
    loadmessages(roomCode, userId);
  });
});
