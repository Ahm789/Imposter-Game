let socket;       // global socket
let playerCount = 0; // global player count
window.addEventListener("DOMContentLoaded", () => {

  const hstroomCode = sessionStorage.getItem("roomCode");
  const proomCode = localStorage.getItem("proomCode");
  const roomCode = hstroomCode || proomCode;

  // If user somehow opens end.html without a room
  if (!roomCode && localStorage.getItem("onlineMode") === "true") {
    window.location.href = "index.html";
    return;
  }

  window.addEventListener("pagehide", function () {

    const isInternalNav = sessionStorage.getItem("internalNavigation");

    // If navigation was triggered by your own button (restart / lobby etc)
    if (isInternalNav === "true") {
      sessionStorage.removeItem("internalNavigation");
      return;
    }

    const hostId = localStorage.getItem("hostId");
    const playerId = localStorage.getItem("playerId");
    const userId = hostId || playerId;

    if (!roomCode) return;

    // PLAYER leaving
    if (playerId) {

      navigator.sendBeacon(
        "/api/leave-room",
        JSON.stringify({ roomCode, playerId: userId })
      );

      localStorage.removeItem("playerId");
      localStorage.removeItem("proomCode");
      localStorage.removeItem("playerName");
      localStorage.setItem("onlineMode", false);

    }

    // HOST leaving
    else if (hostId) {

      navigator.sendBeacon(
        "/api/close-room",
        JSON.stringify({ roomCode, hostId })
      );

      localStorage.removeItem("hostId");
      sessionStorage.removeItem("roomCode");
      localStorage.removeItem("hostName");
      localStorage.setItem("onlineMode", false);
    }
  });
});
window.addEventListener("DOMContentLoaded", () => {
  const onlineMode = localStorage.getItem("onlineMode") === "true";
  document.getElementById("hostWait").style.display = "none";
  if (!onlineMode) {
    document.getElementById("playerCount").parentElement.style.display = "none";
    document.getElementById("roomDisplay").parentElement.style.display = "none";
    normalend();
    return;
  }
  // ---------------- Online mode ----------------
  getgamestate();
  if (onlineMode) {
  const socket = io();
  const playerCountEl = document.getElementById("playerCount");
  const hstroomCode = sessionStorage.getItem("roomCode");
  const proomCode = localStorage.getItem("proomCode");
  const roomCode = hstroomCode || proomCode;

  const hostId = localStorage.getItem("hostId");
  const playerId = localStorage.getItem("playerId");
  const userId = hostId || playerId;

  socket.emit("join-room", { roomCode, userId }); 

    socket.on("room-update", (players) => {
      playerCount = players.length;
      playerCountEl.textContent = `${players.length} player(s) connected`;
  });
  socket.on("room-closed", () => {
        if (hostId){
          localStorage.removeItem("hostId")
          sessionStorage.removeItem("roomCode");
          localStorage.removeItem("hostName");
          localStorage.setItem("onlineMode", false);
          window.location.href = "index.html"
        }
        else{
          sessionStorage.setItem("errorMsg", "The host closed the game");
          sessionStorage.setItem("internalNavigation", "true");
          localStorage.removeItem("playerId")
          localStorage.removeItem("proomCode")
          localStorage.removeItem("playerName");
          localStorage.setItem("onlineMode", false)
          window.location.href ="join.html";
        }
    });
  document.getElementById("roomDisplay").textContent = roomCode;
    socket.on("phase-changed", (roomstate) => {
      console.log("Phase changed to:", roomstate.state);

      if (roomstate.state === "playing") {
        if (hostId === userId) {
          localStorage.setItem("restart", true);
          sessionStorage.setItem("internalNavigation", "true");
          window.location.href = "game.html?restart=true";
        } else {
          localStorage.setItem("restart", true);
          sessionStorage.setItem("internalNavigation", "true");
          window.location.href = "lobby.html";
        }
      }
    });
  }
});
async function getgamestate() {
  const hstroomCode = sessionStorage.getItem("roomCode");
  const proomCode = localStorage.getItem("proomCode");
  const roomCode = hstroomCode || proomCode;
  let votingEnabled = false;

  const res = await fetch(`/api/check-voting?roomCode=${roomCode}`);
  const data = await res.json();
  votingEnabled = data.votingEnabled;
  if (votingEnabled) {
    resultscreen();
  } else {
    normalend();
  }
}
function normalend() {
  const roomCode = sessionStorage.getItem("roomCode") || localStorage.getItem("proomCode");
  const hostId = localStorage.getItem("hostId");
  const playerId = localStorage.getItem("playerId");
  document.getElementById("restartBtn").addEventListener("click", () => {
    const onlineMode = localStorage.getItem("onlineMode") === "true";
    if (onlineMode){
      if (playerCount >= 3){
        const socket = io();
      // Host wants to restart
      socket.emit("next-phase", { roomCode, playerId: hostId, nextState: "playing" });
      }
      else {
        document.getElementById("rhostName").style.display = "block";
        document.getElementById("errorMsg").textContent = "Not enough players in the lobby";
        setTimeout(() => {
        document.getElementById("rhostName").style.display = "none";
      }, 5000); // 5000ms = 5 seconds
      }
    }
    else{
      sessionStorage.setItem("internalNavigation", "true");
      window.location.href = "game.html?restart=true";
    }
  });
  document.getElementById("settingsBtn").addEventListener("click", () => {
    const onlineMode = localStorage.getItem("onlineMode") === "true";
    if (onlineMode){
      localStorage.setItem("previousPage", window.location.pathname);
    }
    else{
      localStorage.setItem("previousPage", window.location.pathname); // store current page
    }
    sessionStorage.setItem("internalNavigation", "true");
    window.location.href = "settings.html"; // navigate after storing
  });
  document.getElementById("homeBtn").addEventListener("click", () => {
    if (roomCode && hostId) {
      try {
          fetch("/api/close-room", {
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
      sessionStorage.removeItem("roomCode");
      localStorage.removeItem("hostId");
      localStorage.removeItem("hostName");
      localStorage.setItem("onlineMode", false)
      window.location.href = "index.html";
    }
    else{
      try {
            fetch("/api/leave-room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomCode, playerId })
            });
        } catch (err) {
            console.error("Error leaving room:", err);
        }
      localStorage.removeItem("playerId");
      localStorage.removeItem("proomCode");
      localStorage.removeItem("playerName");
      localStorage.setItem("onlineMode", false);
      sessionStorage.setItem("internalNavigation", "true");
      window.location.href = "index.html";
    }
  });
}
async function resultscreen() {
   const socket = io();

  const hstroomCode = sessionStorage.getItem("roomCode");
  const proomCode = localStorage.getItem("proomCode");
  const roomCode = hstroomCode || proomCode;

  const hostId = localStorage.getItem("hostId");
  const playerId = localStorage.getItem("playerId");
  const userId = hostId || playerId;
  if (hostId == userId) {
  // Host → show everything
  document.getElementById("restartBtn").style.display = "block";
  document.getElementById("settingsBtn").style.display = "block";
  document.getElementById("homeBtn").style.display = "block";
} else {
  // Players → only show Home
  document.getElementById("restartBtn").style.display = "none";
  document.getElementById("settingsBtn").style.display = "none";
  document.getElementById("homeBtn").style.display = "block";
  document.getElementById("hostWait").style.display = "block";
}

    // ---------------- Voting-enabled online ----------------
  socket.emit("join-room", { roomCode, userId });
  socket.on("phase-changed", (roomstate) => {
        if (hostId != userId)
        {
          sessionStorage.setItem("internalNavigation", "true");
          window.location.href = "lobby.html";
        }
        else{
          localStorage.setItem("restart", true);
          sessionStorage.setItem("internalNavigation", "true");
          window.location.href = "game.html?restart=true";
        }
    });

  try {
    const res = await fetch(`/api/get-results?roomCode=${roomCode}`);
    const data = await res.json();

    if (!data.success) {
      normalend();
      return;
    }

    results = (data.results);

  } catch (err) {
    console.error("Failed to fetch results:", err);
    normalend();
  }

  const role = localStorage.getItem("role"); // "imposter" or "player"
  const resultType = results.resultType;

  switch (resultType) {
    case "draw":
      if (role === "imposter") {
        showImposterWonScreen(results.correctWord, true);
      } else {
        showPlayersLostScreen(results.imposters, true);
      }
      break;

    case "imposter-win":
      if (role === "imposter") {
        showImposterWonScreen(results.correctWord, false);
      } else {
        showPlayersLostScreen(results.imposters, false);
      }
      break;

    case "players-win":
      if (role === "imposter") {
        showImposterLostScreen(results.correctWord);
      } else {
        showPlayersWonScreen(results.imposters);
      }
      break;

    case "game-noImposter":
      // Everyone sees the word, no imposters this round
      showNoImposterScreen(results.correctWord);
      break;
  }
  normalend();
}
function showImposterWonScreen(correctWord, isDraw) {
  document.getElementById("imposterWonSelf").classList.remove("hidden");
  document.getElementById("correctWord").textContent = correctWord;
  document.getElementById("imposterWonSelfTitle").textContent = isDraw ? "Draw" : "You Won 🎉";
}
function showPlayersLostScreen(imposters , isDraw) {
  document.getElementById("imposterWonPlayers").classList.remove("hidden");
  const names = imposters.map(i => i.name).join(", ");
  const hints = imposters
    .map(i => i.hint || "No hint")
    .join(", ");
  document.getElementById("imposterName").textContent = names;
  document.getElementById("imposterHintPlayers").textContent = hints;
  document.getElementById("imposterWonPlayersTitle").textContent = isDraw ? "Draw" : "Imposter Wins";
}
function showImposterLostScreen(correctWord) {
  document.getElementById("imposterLost").classList.remove("hidden");
  document.getElementById("correctWordLost").textContent = correctWord;
}
function showPlayersWonScreen(imposters) {
  document.getElementById("playersWon").classList.remove("hidden");
  const names = imposters.map(i => i.name).join(", ");
  const hints = imposters
    .map(i => i.hint || "No hint")
    .join(", ");
  document.getElementById("imposterNameWon").textContent = names;
  document.getElementById("imposterHint").textContent = hints;
}
function showNoImposterScreen(word) {
  document.getElementById("noImposterRound").classList.remove("hidden");
  document.getElementById("noImposterWord").textContent = word;
}
