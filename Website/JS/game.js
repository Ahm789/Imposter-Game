window.addEventListener("DOMContentLoaded", () => {
  const hstroomCode = sessionStorage.getItem("roomCode");
  const roomCode = hstroomCode;
   const onlineMode = localStorage.getItem("onlineMode")
   if (onlineMode === "true" && !roomCode){
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


    const hostId = localStorage.getItem("hostId");
      navigator.sendBeacon(
        "/api/close-room",
        JSON.stringify({ roomCode, hostId })
      );
      localStorage.removeItem("hostId");
      sessionStorage.removeItem("roomCode");
      localStorage.removeItem("hostName");
      localStorage.setItem("onlineMode", false);
      window.location.replace("index.html");
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const onlineMode = localStorage.getItem("onlineMode") === "true";
  const msg = sessionStorage.getItem("errorMsg");
  if (msg != null) {
    // Show it however you want
    document.getElementById("rhostName").style.display = "block";
    document.getElementById("errorMsg").textContent = msg;
        setTimeout(() => {
        document.getElementById("rhostName").style.display = "none";
      }, 5000); // 5000ms = 5 seconds

    // CRITICAL: remove it immediately
    sessionStorage.removeItem("errorMsg");
  }

  if (onlineMode) {
    startOnlineGame();
  } else {
    startLocalGame();
  }
});
// Common UI elements
  document.getElementById("settingsBtn").addEventListener("click", () => {
    localStorage.setItem("previousPage", window.location.pathname); // store current page
    sessionStorage.setItem("internalNavigation", "true");
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
    let imposterChance = parseFloat(localStorage.getItem("chance")) || 0.2; // default 1
    let randomImposters = localStorage.getItem("zimposters") || "No"; // "Yes" or "No"

    // Load other settings
    let difficulty = (localStorage.getItem("difficulty") || "Medium").toLowerCase(); // normalize
    const hintToggle = localStorage.getItem("hintToggle") || "Yes";
    let selectedGenre = localStorage.getItem("genre") || "Random";

    // Get random word object from the genre
    selectedWordObj = genreManager.getRandomWord(selectedGenre);
    selectedGenre = localStorage.getItem("Gamegenre");
    // If randomImposters is "Yes", set imposterCount to 0 randomly (50% for testing)
    if (randomImposters === "Yes") {
      const randomChance = Math.random(); // 0 → 1
      if (randomChance < imposterChance) { // 50% chance to set zero imposters
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
        sessionStorage.setItem("internalNavigation", "true");
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
    let playerCount = 0;
    const roomCode = sessionStorage.getItem("roomCode");
    const hostId = localStorage.getItem("hostId"); // host's ID
    const hostName = localStorage.getItem("hostName");
    // Redirect if not in a room
    if (!roomCode || !hostId) {
      sessionStorage.setItem("internalNavigation", "true");
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
        playerCount = players.length;
    });
    console.log("Socket listeners set up for lobby",hostId);
    // If host closed the room (from another tab), redirect
    socket.on("room-closed", () => {
        sessionStorage.removeItem("roomCode");
        localStorage.removeItem("hostId");
        sessionStorage.setItem("internalNavigation", "true");
        window.location.href = "create.html";
    });
    socket.on("all-imposters-gone", () => {
    // e.g., end the game or assign new imposters
    sessionStorage.setItem("errorMsg", "Imposter left the game");
      if (hostId){
        sessionStorage.setItem("internalNavigation", "true");
        window.location.href = "game.html";
      }
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
                  if(data.error) return console.log(data.error);
                });
            } catch (err) {
                console.error("Error leaving room:", err);
            }
        }

        sessionStorage.removeItem("roomCode");
        localStorage.removeItem("hostId");
        sessionStorage.setItem("internalNavigation", "true");
        window.location.href = "create.html";
    });
    
    // ==================== START GAME ====================
    // Start button click
    startBtn.addEventListener("click", () => {
      if (playerCount > 3){
          // Show it however you want
          document.getElementById("rhostName").style.display = "block";
          document.getElementById("errorMsg").textContent = "Not enough players";
              setTimeout(() => {
              document.getElementById("rhostName").style.display = "none";
            }, 5000); // 5000ms = 5 seconds
      }
      else{
        startGame();
      }
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
            imposterCount: parseInt(localStorage.getItem("imposters")),
            randomImposters: localStorage.getItem("zimposters"),
            imposterChance : parseFloat(localStorage.getItem("chance")),
            difficulty: localStorage.getItem("difficulty"),
            hintToggle: localStorage.getItem("hintToggle"),
            genre: localStorage.getItem("genre"),
            voting: localStorage.getItem("voting") === "Yes",
            chat: localStorage.getItem("chat") === "Yes",
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
    // ---------------- Client-side (players) ----------------

          
    // Listen for server sending the actual game data
    socket.on("game-started", (data) => {
      window.requestAnimationFrame(() => {
          showOnlineGameOverlay(data);
      });
  });
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      socket.emit("join-room", { roomCode, hostId, isHost: true });

      if (localStorage.getItem("restart") === "true") {
          localStorage.removeItem("restart");

          // Small delay ensures server registers the room join
          setTimeout(() => {
              startGame().catch(err => {
                  console.error("Failed to restart game:", err);
              });
          }, 100);
      }
  });
    function showOnlineGameOverlay(gameData) {
        const overlay = document.getElementById("gameOverlay");
        const overlayText = document.getElementById("overlayText");
        const countdownEl = document.getElementById("countdown");

        const hostId = localStorage.getItem("hostId");
        const currentPlayer = gameData.players.find(p => p.id === hostId);
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

            // STEP 3 — Click again //NEXT STEPS CAN CHANGE
            // -------------------- Host click triggers next phase --------------------
            overlay.onclick = async () => {
              overlay.onclick = null;  // prevent double-click
              overlay.classList.add("hidden");

              try {

                const [voteRes, chatRes] = await Promise.all([
                    fetch(`/api/check-voting?roomCode=${roomCode}`),
                    fetch(`/api/check-chat?roomCode=${roomCode}`)
                ]);

                const voteData = await voteRes.json();
                const chatData = await chatRes.json();
                sessionStorage.setItem("internalNavigation", "true");

                if (chatData.chatEnabled && voteData.votingEnabled) {
                    window.location.href = "chat.html";
                } 
                else if (voteData.votingEnabled) {
                    window.location.href = "voting.html";
                }
                else {
                    window.location.href = "end.html";
                }

            } catch (err) {
                console.error("Failed to check game state:", err);
                sessionStorage.setItem("internalNavigation", "true");
            }
          };
        };
    }
}
