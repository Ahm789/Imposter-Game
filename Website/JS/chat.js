const socket = io(); // connect to server
window.addEventListener("load", async () => {
  const roomCode = localStorage.getItem("proomCode") || sessionStorage.getItem("roomCode");
  const userId = localStorage.getItem("hostId") || localStorage.getItem("playerId");
  console.log("Room code:", roomCode);
  document.getElementById("backBtn").addEventListener("click", () => {
    sessionStorage.setItem("internalNavigation", "true");
    window.location.href = "voting.html";
  });
  document.getElementById("backBtn").addEventListener("click", () => {
    sessionStorage.setItem("internalNavigation", "true");
    window.location.href = "voting.html";
  });
  loadmessages(roomCode, userId);
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
