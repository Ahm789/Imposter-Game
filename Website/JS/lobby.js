window.addEventListener("pagehide", function () {
    const isInternalNav = sessionStorage.getItem("internalNavigation");
    // If this is internal navigation, don't leave room
    if (isInternalNav === "true") {
      sessionStorage.removeItem("internalNavigation");
      return;
    }
    // Immediately block backward navigation
    const proomCode = localStorage.getItem("proomCode");
    const roomCode =  proomCode;
    const playerId = localStorage.getItem("playerId");

    navigator.sendBeacon(
    "/api/leave-room",
    JSON.stringify({ roomCode, playerId })
    );
    localStorage.removeItem("playerId");
    localStorage.removeItem("proomCode");
    localStorage.removeItem("playerName");
    localStorage.setItem("onlineMode", false);
    socket.emit("player-left", { roomCode, playerId });
    window.location.replace("join.html");
});

document.addEventListener("DOMContentLoaded", () => {
  const msg = sessionStorage.getItem("errorMsg");

  if (msg) {
    // Show it however you want
    document.getElementById("errors").style.display = "block";
    document.getElementById("error").textContent = msg;
        setTimeout(() => {
        document.getElementById("errors").style.display = "none";
      }, 5000); // 5000ms = 5 seconds

    // CRITICAL: remove it immediately
    sessionStorage.removeItem("errorMsg");
  }
  const hstroomCode = sessionStorage.getItem("roomCode");
  const proomCode = localStorage.getItem("proomCode");
  const roomCode = hstroomCode || proomCode;
  if (roomCode == null){
    window.location.href = "join.html";
  }
});
// ======================= SOCKET.IO =======================
const socket = io(); // connect to server

// Grab DOM elements
const backBtn = document.getElementById("backBtn");
const playerCountEl = document.getElementById("playerCount");

// Get stored room info
const roomCode = localStorage.getItem("proomCode");
const playerId = localStorage.getItem("playerId");

// Redirect if no roomCode
if (!roomCode || !playerId) {
    sessionStorage.setItem("internalNavigation", "true");
    window.location.href = "join.html";
}
// ======================= JOIN SOCKET ROOM =======================
socket.emit("join-room", { roomCode, playerId });

// Update lobby when server sends player list
socket.on("room-update", (players) => {
    playerCountEl.textContent = `${players.length} player(s) connected`;
});
document.getElementById("roomDisplay").textContent = roomCode;
// Catch-up fetch in case the game already started
fetch(`/api/current-game/${roomCode}`)
  .then(res => res.json())
  .then(data => {
    if (data.state === "playing" && data.gameData) {
        showOnlineGameOverlay(data.gameData);
    }
  })
  .catch(err => console.error("Failed to fetch current game:", err));

socket.on("game-started", data => {
  const me = data.players.find(p => p.id === localStorage.getItem("playerId"));
  showOnlineGameOverlay(data); // overlay logic
});
// Handle host closing the room
socket.on("room-closed", () => {
    sessionStorage.setItem("errorMsg", "The host closed the game");
    localStorage.removeItem("proomCode");
    localStorage.removeItem("playerId");
    sessionStorage.setItem("internalNavigation", "true");
    window.location.href = "join.html";
});
socket.on("player-kicked", ({ kickedId }) => {
  const myId = localStorage.getItem("playerId") || localStorage.getItem("hostId");

  if (kickedId === myId) {
    sessionStorage.setItem("errorMsg", "You were kicked from the game");
    localStorage.removeItem("proomCode");
    localStorage.removeItem("playerId");
    sessionStorage.setItem("internalNavigation", "true");
    window.location.href = "join.html";
  }
});
// ======================= LEAVE ROOM =======================

// When player clicks back
backBtn.addEventListener("click", async () => {
    if (roomCode && playerId) {
        try {
            await fetch("/api/leave-room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomCode, playerId })
            });
        } catch (err) {
            console.error("Error leaving room:", err);
        }
    }

    localStorage.removeItem("proomCode");
    localStorage.removeItem("playerId");
    sessionStorage.setItem("internalNavigation", "true");
    window.location.href = "join.html";
});

// When tab/window closes
function showOnlineGameOverlay(gameData) {
        const overlay = document.getElementById("gameOverlay");
        const overlayText = document.getElementById("overlayText");
        const countdownEl = document.getElementById("countdown");


        const playerId = localStorage.getItem("playerId");
        const currentPlayer = gameData.players.find(p => p.id === playerId);
        localStorage.setItem("role", currentPlayer.role); // Store role for end screen

        if (!overlay || !overlayText) {
            console.error("Overlay elements missing from DOM");
            return;
        }

        if (!currentPlayer) {
            overlayText.textContent = "Error: Could not find your player info!";
            overlay.classList.remove("hidden");
            return;
        }

        overlay.classList.remove("hidden");

        // STEP 1 — Show pass screen first
        overlayText.classList.remove("role-text");
        countdownEl.style.display = "none";
        overlayText.textContent = "Tap to reveal your role";

        overlay.onclick = () => {
            overlay.onclick = null;

            // STEP 2 — Show word / role
            overlayText.classList.add("role-text");

            if (currentPlayer.role === "imposter") {
                overlayText.innerHTML = `
                    <div>You are the <strong>IMPOSTER</strong></div>
                    <div>Hint: ${currentPlayer.hint || "No hint available"}</div>
                `;
            } else {
                overlayText.innerHTML = `
                    <div>Word: <strong>${gameData.word}</strong></div>
                `;
            }

            // STEP 3 — Click again
            overlay.onclick = async () => {
                overlay.onclick = null;  // prevent double-click
                overlay.classList.add("hidden");

                try {
                    const roomCode = localStorage.getItem("proomCode");
                    localStorage.setItem("proomCode", roomCode);
                    const [voteRes, chatRes] = await Promise.all([
                    fetch(`/api/check-voting?roomCode=${localStorage.getItem("proomCode")}`),
                    fetch(`/api/check-chat?roomCode=${localStorage.getItem("proomCode")}`)
                    ]);
                    const voteData = await voteRes.json();
                    const chatData = await chatRes.json();


                    // Redirect based on server voting status
                    sessionStorage.setItem("internalNavigation", "true");

                    if (chatData.chatEnabled && voteData.votingEnabled) {
                        window.location.href = "chat.html";
                    } 
                    else if (voteData.votingEnabled) {
                        window.location.href = "voting.html";
                    }
                    else {
                        overlay.classList.add("hidden");
                    }
                } catch (err) {
                    console.error("Failed to check voting:", err);
                    // fallback
                    sessionStorage.setItem("internalNavigation", "true");
                    window.location.href = "end.html";
                }
            };
        };
    }