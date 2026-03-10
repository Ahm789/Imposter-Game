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
window.addEventListener("load", () => {
  const hstroomCode = sessionStorage.getItem("roomCode");
  const proomCode = localStorage.getItem("proomCode");
  const roomCode = hstroomCode || proomCode;
  const socket = io();
  const playerName = localStorage.getItem("playerName");
  const hostName = localStorage.getItem("hostName");

  const userName = hostName || playerName;
  const hostId = localStorage.getItem("hostId");
  const playerId = localStorage.getItem("playerId");
  const userId = hostId || playerId;

  socket.emit("join-room", { roomCode, userId });
  socket.emit("player-left", { roomCode, playerId });
  const advanceBtn = document.getElementById("resultsBtn");

  // Listeners
  socket.on("not-all-voted", ({ totalVotes, totalPlayers }) => {
    document.getElementById("notVoted").style.display = "block";
    document.getElementById("votedPlayers").textContent = `Not all players have voted yet. (${totalVotes}/${totalPlayers})`;
    setTimeout(() => {
        document.getElementById("notVoted").style.display = "none";
      }, 3000); // 3000ms = 3 seconds
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
  const playerCountEl = document.getElementById("playerCount");
    socket.on("vote-update", ({ totalVotes, totalPlayers }) => {
      playerCountEl.textContent = `${totalVotes} / ${totalPlayers}`;
  });
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
  // Keep a copy of the previous players
  let prevPlayers = [];

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
  socket.on("room-update", (players) => {
    // 1️⃣ Current player IDs
    const currentIds = players.map(p => p.id);

    // 2️⃣ Players who left = in prevPlayers but not in current
    const leftPlayers = prevPlayers.filter(p => !currentIds.includes(p.id));

    leftPlayers.forEach(p => {
      console.log(`${p.name} has left the room`);
      // Optional: show a UI message
      loadPlayers();
      document.getElementById("left").style.display = "block";
      document.getElementById("playerLeft").textContent = p.name;
      document.getElementById("yourVoteContainer").style.display = "none";
      document.getElementById("voteDropdown").disabled = false;
      document.getElementById("submitVoteBtn").disabled = false;
      setTimeout(() => {
        document.getElementById("left").style.display = "none";
      }, 3000); // 3000ms = 3 seconds
      if (players.length < 3){
        sessionStorage.setItem("errorMsg", "Not enough players left in the game");
        if (hostId){
          sessionStorage.setItem("internalNavigation", "true");
          window.location.href = "game.html";
        }
        else{
          sessionStorage.setItem("internalNavigation", "true");
          window.location.href = "lobby.html";
        }
      }
      else{
        if (hostId){
          document.getElementById("lobbyBtn").style.display = "block";
          document.getElementById("resultsBtn").style.marginTop = "-5px";
        }
      }
      socket.emit("player-left", { roomCode, playerId: p.id });
    });

    // 3️⃣ Players who joined = in current but not in prev
    const joinedPlayers = players.filter(p => !prevPlayers.map(p => p.id).includes(p.id));

    joinedPlayers.forEach(p => {
      console.log(`${p.name} has joined the room`);
    });

    // 4️⃣ Update prevPlayers for next update
    prevPlayers = players;
  });
  // Button emit
  advanceBtn.addEventListener("click", () => {
    // ✅ Use the already declared hostId
    socket.emit("host-advance-results", { roomCode, playerId: hostId });
  });
  lobbyBtn.addEventListener("click", () => {
    if (hostId){
      socket.emit("back-to-lobby", { roomCode, hostId });
    }
  });

  if (userName) {
    document.getElementById("userName").textContent = `You are: ${userName}`;
  }


  if (!userName) {
    console.error("No username found.");
    return;
  }
  if (userId != hostId)
  {
    document.getElementById("resultsBtn").style.display = "none";
    document.getElementById("phaseTitle").textContent = "Voting Phase - Player View";
  }

  // Display user ID on page
    document.getElementById("userName").textContent =
    `You are: ${userName}`;
  // =========================
  // TEST: Populate dropdown with host Name
  // =========================

  loadPlayers();
  let playersList = []; // store all players globally
  async function loadPlayers() {

        try {
            const res = await fetch(`/api/players?roomCode=${roomCode}`);
            const data = await res.json();

            if (data.error) {
            console.error(data.error);
            return;
            }
            playersList = data.players; // save globally
            populateDropdown(data.players);
        } catch (err) {
            console.error("Failed to load players:", err);
        }
    }
    function populateDropdown(players) {
        const dropdown = document.getElementById("voteDropdown");
        dropdown.innerHTML = `<option value="">Select a player</option>`;

        players.forEach(player => {
          const option = document.createElement("option");
          if (player.name != userName) {
            option.value = player.id;
            option.textContent = player.name;
            dropdown.appendChild(option);
          }
        });
        }
  // =========================
  // Submit Vote (Test Mode)
  // =========================
  const submitBtn = document.getElementById("submitVoteBtn");

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {

      const selectedVote = voteDropdown.value;
      const selectedPlayer = playersList.find(p => p.id === selectedVote);

      if (!selectedVote) {
        document.getElementById("notVoted").style.display = "block";
        document.getElementById("votedPlayers").textContent = "Please select a player first";
        return;
      }
      console.log("Submitting vote...");
      console.log("Room:", roomCode);
      console.log("Voter ID:", userName);
      console.log("Vote Target:", selectedVote);
      console.log("userId:", userId);

      // For now just log it
      // Later we will emit:
        socket.emit("submit-vote", {
          roomCode,
          playerId: userName,
          voteTarget: selectedVote
        });        
        document.getElementById("notVoted").style.display = "none";
        const yourVoteContainer = document.getElementById("yourVoteContainer");
        const yourVoteEl = document.getElementById("yourVote");
        yourVoteEl.textContent = selectedPlayer.name;
        yourVoteContainer.style.display = "block"; // reveal
        submitBtn.textContent = "Vote Submitted";
        submitBtn.disabled = true;
        const dropdown = document.getElementById("voteDropdown");
        dropdown.disabled = true;
    });
  }
  const voteList = document.getElementById("voteList");
let selectedPlayerId = null;

// Example player list for testing (replace with server data)
// const players = [
//   { id: "host123", name: "Host" }
// ];

// // Populate buttons
// players.forEach(player => {
//   const btn = document.createElement("button");
//   btn.classList.add("vote-btn");
//   btn.textContent = player.name;
//   btn.dataset.playerid = player.id;

//   // click handler for selecting
//   btn.addEventListener("click", () => {
//     // Deselect all
//     document.querySelectorAll(".vote-btn").forEach(b => b.classList.remove("selected"));

//     // Select this one
//     btn.classList.add("selected");
//     selectedPlayerId = player.id;
//   });

//   voteList.appendChild(btn);
// });

// // Submit vote button
// const submitBtn1 = document.getElementById("submitVoteBtnButtons");
// submitBtn1.addEventListener("click", () => {
//   if (!selectedPlayerId) {
//     alert("Please select a player to vote for!");
//     return;
//   }

//   console.log("Voted for:", selectedPlayerId);
//   // Here you can emit to server:
//   // socket.emit("submit-vote", { roomCode, playerId, voteTarget: selectedPlayerId });
// });

});