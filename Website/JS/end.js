// Push a state so we can detect backward navigation
// Force a history entry
  history.pushState(null, "", location.href);

  window.addEventListener("popstate", function () {

    // Block backward navigation
    history.pushState(null, "", location.href);

    const hstroomCode = sessionStorage.getItem("roomCode");
    const proomCode = localStorage.getItem("proomCode");
    const roomCode = hstroomCode || proomCode;

    const hostId = localStorage.getItem("hostId");
    const playerId = localStorage.getItem("playerId");
    const userId = hostId || playerId;

    if (roomCode && playerId) {
      fetch("/api/leave-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, playerId: userId })
      });

      localStorage.removeItem("playerId");
      localStorage.removeItem("proomCode");
      localStorage.removeItem("playerName");
      localStorage.setItem("onlineMode", false);

      window.location.replace("join.html");
    } 
    else if (roomCode && hostId) {
      fetch("/api/close-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, hostId })
      });

      localStorage.removeItem("hostId");
      sessionStorage.removeItem("roomCode");
      localStorage.removeItem("hostName");
      localStorage.setItem("onlineMode", false);

      window.location.replace("index.html");
    }
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
          window.location.href = "game.html?restart=true";
        } else {
          localStorage.setItem("restart", true);
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
      const socket = io();
      // Host wants to restart
      socket.emit("next-phase", { roomCode, playerId: hostId, nextState: "playing" });
    }
    else{
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
          window.location.href = "lobby.html";
        }
        else{
          localStorage.setItem("restart", true);
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
  if (resultType === "draw"){
    if (role === "imposter") {
      showImposterWonScreen(results.correctWord, true);
    } else {
      showPlayersLostScreen(results.imposterName, results.imposterHint , true);
    }
  }
  if (resultType === "imposter-win") {
    if (role === "imposter") {
      showImposterWonScreen(results.correctWord, false);
    } else {
      showPlayersLostScreen(results.imposterName, results.imposterHint , false);
    }
  }

  if (resultType === "players-win") {
    if (role === "imposter") {
      showImposterLostScreen(results.correctWord);
    } else {
      showPlayersWonScreen(results.imposterHint, results.imposterName);
    }
  }
  normalend();
}
function showImposterWonScreen(correctWord, isDraw) {
  document.getElementById("imposterWonSelf").classList.remove("hidden");
  document.getElementById("correctWord").textContent = correctWord;
  document.getElementById("imposterWonSelfTitle").textContent = isDraw ? "Draw" : "You Won 🎉";
}
function showPlayersLostScreen(imposterName, imposterHint , isDraw) {
  document.getElementById("imposterWonPlayers").classList.remove("hidden");
  document.getElementById("imposterName").textContent = imposterName;
  document.getElementById("imposterHintPlayers").textContent = imposterHint;
  document.getElementById("imposterWonPlayersTitle").textContent = isDraw ? "Draw" : "Imposter Wins";
}
function showImposterLostScreen(correctWord) {
  document.getElementById("imposterLost").classList.remove("hidden");
  document.getElementById("correctWordLost").textContent = correctWord;
}
function showPlayersWonScreen(imposterHint, imposterName) {
  document.getElementById("playersWon").classList.remove("hidden");
  document.getElementById("imposterHint").textContent = imposterHint;
  document.getElementById("imposterNameWon").textContent = imposterName;
}
