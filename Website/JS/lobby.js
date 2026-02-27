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
    window.location.href = "join.html";
}

// ======================= JOIN SOCKET ROOM =======================
socket.emit("join-room", { roomCode, playerId });

// Update lobby when server sends player list
socket.on("room-update", (players) => {
    playerCountEl.textContent = `${players.length} player(s) connected`;
});
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
    alert("Host closed the room. Returning to join page.");
    localStorage.removeItem("proomCode");
    localStorage.removeItem("playerId");
    window.location.href = "join.html";
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
                    const res = await fetch(`/api/check-voting?roomCode=${roomCode}`);
                    const data = await res.json();
                    localStorage.setItem("proomCode", roomCode);

                    // Redirect based on server voting status
                    if (data.votingEnabled) {
                        window.location.href = "voting.html";
                    } else {
                        overlay.classList.add("hidden");
                    }
                } catch (err) {
                    console.error("Failed to check voting:", err);
                    // fallback
                    window.location.href = "end.html";
                }
            };
        };
    }