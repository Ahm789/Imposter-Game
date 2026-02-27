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

  const advanceBtn = document.getElementById("resultsBtn");

  // Listeners
  socket.on("not-all-voted", ({ totalVotes, totalPlayers }) => {
    alert(`Not all players have voted yet. (${totalVotes}/${totalPlayers})`);
  });

  socket.on("phase-changed", ({ state }) => {
    if (state === "results") {
      if (userId === hostId) {
        window.location.href = "end.html";
      }
      window.location.href = "end.html";
    }
  });
  const playerCountEl = document.getElementById("playerCount");
    socket.on("vote-update", ({ totalVotes, totalPlayers }) => {
      playerCountEl.textContent = `${totalVotes} / ${totalPlayers}`;
  });
  // Button emit
  advanceBtn.addEventListener("click", () => {
    // ✅ Use the already declared hostId
    socket.emit("host-advance-results", { roomCode, playerId: hostId });
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
        document.getElementById("voted").style.display = "block";
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
        document.getElementById("voted").style.display = "none";
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