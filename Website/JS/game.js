window.addEventListener("DOMContentLoaded", () => {
  const onlineMode = localStorage.getItem("onlineMode") === "true";

  if (onlineMode) {
    startOnlineGame();
  } else {
    startLocalGame();
  }
});
// Common UI elements
  document.getElementById("settingsBtn").addEventListener("click", () => {
      localStorage.setItem("previousPage", window.location.pathname); // store current page
    window.location.href = "settings.html";
  });
  const infoBtn = document.getElementById("infoBtn");
  const rulesModal = document.getElementById("rulesModal");
  const closeRules = document.getElementById("closeRules");

  infoBtn.addEventListener("click", () => {
    rulesModal.classList.remove("hidden");
  });

  closeRules.addEventListener("click", () => {
    rulesModal.classList.add("hidden");
  });

  // Close modal if clicking outside the content
  rulesModal.addEventListener("click", (e) => {
    if (e.target === rulesModal) {
      rulesModal.classList.add("hidden");
    }
  });

  const startBtn = document.getElementById("startBtn");
  const overlay = document.getElementById("gameOverlay");
  const overlayText = document.getElementById("overlayText");
  const countdownEl = document.getElementById("countdown");

  const genreManager = new GenreManager();


// Local game logic
function startLocalGame() {
    document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  let players = [];
  let currentPlayerIndex = 0;

  startBtn.addEventListener("click", startGame);

  function startGame() {
    // Load settings from localStorage
    const playerCount = parseInt(localStorage.getItem("players")) || 4; // default 4
    let imposterCount = parseInt(localStorage.getItem("imposters")) || 1; // default 1
    let randomImposters = localStorage.getItem("zimposters") || "No"; // "Yes" or "No"

    // Load other settings
    let difficulty = (localStorage.getItem("difficulty") || "Medium").toLowerCase(); // normalize
    const hintToggle = localStorage.getItem("hintToggle") || "Yes";
    const selectedGenre = localStorage.getItem("genre") || "General";
    const ageRange = localStorage.getItem("ageRange") || "All";

    // Get random word object from the genre
    selectedWordObj = genreManager.getRandomWord(selectedGenre);

    // If randomImposters is "Yes", set imposterCount to 0 randomly (50% for testing)
    if (randomImposters === "Yes") {
      const randomChance = Math.random(); // 0 → 1
      if (randomChance < 0.2) { // 50% chance to set zero imposters
        imposterCount = 0;
        console.log("Random imposters test: No imposters this game!");
      }
    }

    // Initialize player roles
    players = new Array(playerCount).fill("normal");

    // Assign imposters normally if any
    let assigned = 0;
    while (assigned < imposterCount) {
      let randomIndex = Math.floor(Math.random() * playerCount);
      if (players[randomIndex] === "normal") {
        players[randomIndex] = "imposter";
        assigned++;
      }
    }

    // Assign hints to imposters
    players = players.map(role => {
      if (role === "imposter") {
        return {
          role: "imposter",
          hint: hintToggle === "Yes"
            ? genreManager.getHintWord(selectedGenre, selectedWordObj.word, difficulty)
            : null
        };
      } else {
        return { role: "normal" };
      }
    });

    currentPlayerIndex = 0;
    overlay.classList.remove("hidden");
    countdownEl.style.display = "none";

    showTapToStart();
  }

  // Step 1: Player takes the screen
  function showTapToStart() {
    overlayText.classList.remove("role-text");
    overlayText.textContent = `Player ${currentPlayerIndex + 1} take the screen`;

    const tapText = document.createElement("p");
    tapText.textContent = "Tap to reveal your role";
    tapText.style.marginTop = "20px";
    tapText.style.fontSize = "18px";
    tapText.style.opacity = "0.8";

    overlayText.appendChild(document.createElement("br"));
    overlayText.appendChild(tapText);

    // Skip button for this step simply goes to revealRole
    const skipBtn = createSkipButton();
    skipBtn.onclick = () => {
      skipBtn.remove();
      showPlayerTurn(); // Start countdown to reveal role
    };

    overlay.onclick = () => {
      overlay.onclick = null;
      skipBtn.remove();
      showPlayerTurn(); // Start countdown to reveal role
    };
  }

  // Step 2: Countdown before revealing role
  function showPlayerTurn() {
    countdownEl.style.display = "block";
    overlayText.textContent = `Player ${currentPlayerIndex + 1}`;

    const skipBtn = createSkipButton();
    overlay.appendChild(skipBtn);

    startCountdown(3, () => {
      skipBtn.remove();
      revealRole();
    }, skipBtn, false); // skip only stops timer for this step
  }

  // Step 3: Reveal role
  function revealRole() {
    const player = players[currentPlayerIndex];
  overlayText.classList.add("role-text");

  // Clear previous content
  overlayText.innerHTML = '';

  if (player.role === "imposter") {
      const roleLine = document.createElement("div");
      roleLine.textContent = "You are the IMPOSTER";
      overlayText.appendChild(roleLine);

      const hintLine = document.createElement("div");
      if (player.hint) {
          hintLine.textContent = `Hint: ${player.hint}`;
          hintLine.classList.remove("no-hint"); // just in case
      } else {
          hintLine.textContent = "No hint available";
          hintLine.classList.add("no-hint"); // special CSS for null hint
      }
      overlayText.appendChild(hintLine);

  } else {
      overlayText.textContent = `Word: ${selectedWordObj.word}`;
  }

    const skipBtn = createSkipButton();
    overlay.appendChild(skipBtn);

    startCountdown(5, () => {
      skipBtn.remove();
      showPassOverlay();
    }, skipBtn, false);
  }



  // Step 4: Tap to pass to next player
  function showPassOverlay() {
    overlayText.classList.remove("role-text");
    countdownEl.style.display = "none";
    overlayText.textContent = "Give to next player";

    overlay.onclick = () => {
      overlay.onclick = null;
      currentPlayerIndex++;
      if (currentPlayerIndex >= players.length) {
        overlayText.textContent = "All players have seen their roles!";
        setTimeout(() => window.location.href = "end.html", 2000);
      } else {
        showTapToStart(); // Next player
      }
    };
  }

  // Utility: create a styled skip button
  function createSkipButton() {
    const skipBtn = document.createElement("button");
    skipBtn.textContent = "Skip";
    skipBtn.id = "skipBtn";
    skipBtn.classList.add("game-btn"); // same class as other buttons
    return skipBtn;
  }

  // Countdown function
  function startCountdown(seconds, callback, skipButton = null, stopOnly = true) {
    let timeLeft = seconds;
    countdownEl.textContent = timeLeft;

    const timer = setInterval(() => {
      timeLeft--;
      countdownEl.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(timer);
        if (skipButton) skipButton.remove();
        callback();
      }
    }, 1000);

    if (skipButton) {
      skipButton.onclick = () => {
        clearInterval(timer);
        skipButton.remove();
        if (!stopOnly) callback(); // only call callback if stopOnly=false
      };
    }

    return timer;
  }

  // At the bottom of your script, after all functions
  window.addEventListener("load", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const restart = urlParams.get("restart");

    if (restart === "true") {
      startGame(); // Automatically start the game for the player
    }
  });
}
const isVotingPhaseShown = false; // flag to prevent multiple alerts
// Online game logic
function startOnlineGame() {
    const socket = io(); // connect to server

    const lobbyInfoEl = document.getElementById("lobbyInfo");
    const roomDisplayEl = document.getElementById("roomDisplay");
    const playerCountEl = document.getElementById("playerCount");
    const startBtn = document.getElementById("startBtn");
    const backBtn = document.getElementById("backBtn");

    const roomCode = sessionStorage.getItem("roomCode");
    const hostId = localStorage.getItem("hostId"); // host's ID
    const hostName = localStorage.getItem("hostName");

    // Redirect if not in a room
    if (!roomCode || !hostId) {
        window.location.href = "create.html";
        return;
    }

    // Show lobby info
    lobbyInfoEl.classList.remove("hidden");
    roomDisplayEl.textContent = roomCode;
    console.log("Joined room:", roomCode, "as host:", hostId, "Host Name:", hostName);

    // ==================== SOCKET.IO ====================
    // Join room on server
    socket.emit("join-room", { roomCode, hostId, isHost: true });

    // Listen for room updates
    socket.on("room-update", (players) => {
        playerCountEl.textContent = `${players.length} player(s) connected`;
    });
    console.log("Socket listeners set up for lobby",hostId);
    // If host closed the room (from another tab), redirect
    socket.on("room-closed", () => {
        alert("Host closed the room. Returning to create page.");
        sessionStorage.removeItem("roomCode");
        localStorage.removeItem("hostId");
        window.location.href = "create.html";
    });

    // ==================== HOST LEAVE ====================
    backBtn.addEventListener("click", async () => {
        if (roomCode && hostId) {
            try {
                await fetch("/api/close-room", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ roomCode,hostId })
                }).then(res => res.json())
                .then(data => {
                  if(data.error) return alert(data.error);
                });
            } catch (err) {
                console.error("Error leaving room:", err);
            }
        }

        sessionStorage.removeItem("roomCode");
        localStorage.removeItem("hostId");
        window.location.href = "create.html";
    });

    // ==================== START GAME ====================
    // Start button click
    startBtn.addEventListener("click", () => {
      startGame();
    });
    async function startGame() {
      const hostId = localStorage.getItem("hostId");

      const response = await fetch("/api/start-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: sessionStorage.getItem("roomCode"),
          hostId: hostId,
          settings: {
            imposterCount: localStorage.getItem("imposters"),
            randomImposters: localStorage.getItem("zimposters"),
            difficulty: localStorage.getItem("difficulty"),
            hintToggle: localStorage.getItem("hintToggle"),
            genre: localStorage.getItem("genre"),
            voting: localStorage.getItem("voting") === "Yes"
          }
        })
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      console.log("Game started successfully:", data, hostId);
      return data;
    }

    startBtn.addEventListener("click", () => {
      startGame().catch(err => {
        console.error("Failed to start game:", err);
      });
    });
    // ---------------- Client-side (players) ----------------

          
    // Listen for server sending the actual game data
    socket.on("game-started", (data) => {
      window.requestAnimationFrame(() => {
          showOnlineGameOverlay(data);
      });
  });
    function showOnlineGameOverlay(gameData) {
        const overlay = document.getElementById("gameOverlay");
        const overlayText = document.getElementById("overlayText");
        const countdownEl = document.getElementById("countdown");

        const hostId = localStorage.getItem("hostId");
        const currentPlayer = gameData.players.find(p => p.id === hostId);

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

            // STEP 3 — Click again //NEXT STEPS CAN CHANGE
            // -------------------- Host click triggers next phase --------------------
            overlay.onclick = async () => {
              overlay.onclick = null;  // prevent double-click
              overlay.classList.add("hidden");

              try {
                  const res = await fetch(`/api/check-voting?roomCode=${roomCode}`);
                  const data = await res.json();

                  // Redirect based on server voting status
                  if (data.votingEnabled) {
                      window.location.href = "voting.html";
                  } else {
                    alert("No voting phase enabled. Ending game: Room Code " + roomCode);
                      window.location.href = "end.html";
                  }
              } catch (err) {
                  console.error("Failed to check voting:", err);
                  // fallback
                  window.location.href = "end.html";
              }
          };
        };
    }
}
