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
async function loadmessages(roomCode, userId) {
   try {
    const res = await fetch(`/api/get-messages?roomCode=${roomCode}&userId=${userId}`);
    const data = await res.json();
    console.log("Messages in room:", data.messages);
    const chatContainer = document.getElementById("chatMessages");
    chatContainer.innerHTML = ""; // clear old messages

    data.messages.forEach(msg => {

      const isSelf = msg.userId === userId;

      const messageHTML = `
        <div class="chat-message ${isSelf ? "self" : "other"}">
            <div class="player-name">${isSelf ? "You" : msg.name}</div>
            <div class="message-bubble">
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
  socket.emit("join-room", { roomCode, userId, userName });
  socket.on("typing", ({ userId: typingUserId, userName, typing }) => {
    console.log(`Received typing event from user ${typingUserId}: typing=${typing}`, { userName, typing });
    document.getElementById("typingIndicator").classList.remove("hidden");
    if (typing) {
      document.querySelector(".typing-name").textContent = typingUserId === userId ? "You" : `Player ${userName}`;
    } else {
      document.getElementById("typingIndicator").classList.add("hidden");
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
