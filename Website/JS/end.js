window.addEventListener("DOMContentLoaded", () => {
  const onlineMode = localStorage.getItem("onlineMode") === "true";
  document.getElementById("hostWait").style.display = "none";
  if (!onlineMode) {
    normalend();
    return;
  }
  // ---------------- Online mode ----------------
  getgamestate();
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
  document.getElementById("restartBtn").addEventListener("click", () => {
    window.location.href = "game.html?restart=true";
  });
  document.getElementById("settingsBtn").addEventListener("click", () => {
      localStorage.setItem("previousPage", window.location.pathname); // store current page
    window.location.href = "settings.html";
  });
  document.getElementById("homeBtn").addEventListener("click", () => {
    window.location.href = "index.html";
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
  alert(`User ID: ${userId}, Host ID: ${hostId}, Player ID: ${playerId}, Room Code: ${roomCode}`);
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
  if (resultType === "imposter-win") {
    if (role === "imposter") {
      alert("Congratulations, you were an imposter and won the game!");
      showImposterWonScreen(results.correctWord);
    } else {
      showPlayersLostScreen(results.imposterName, results.imposterHint);
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
function showImposterWonScreen(correctWord) {
  document.getElementById("imposterWonSelf").classList.remove("hidden");
  document.getElementById("correctWord").textContent = correctWord;
  alert(correctWord);
}
function showPlayersLostScreen(imposterName, imposterHint) {
  document.getElementById("imposterWonPlayers").classList.remove("hidden");
  document.getElementById("imposterName").textContent = imposterName;
  document.getElementById("imposterHintPlayers").textContent = imposterHint;
}
function showImposterLostScreen(correctWord) {
  document.getElementById("imposterLost").classList.remove("hidden");
  document.getElementById("correctWordLost").textContent = correctWord;
  alert(correctWord);
}
function showPlayersWonScreen(imposterHint, imposterName) {
  document.getElementById("playersWon").classList.remove("hidden");
  document.getElementById("imposterHint").textContent = imposterHint;
  document.getElementById("imposterNameWon").textContent = imposterName;
}
