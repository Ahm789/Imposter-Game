document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});
document.getElementById("joinBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("nameInput").value.trim();
    if (nameInput === "") {
        alert("Please enter your name to create a game.");
        return;
    }
    const roomCodeInput = document.getElementById("roomCodeInput").value.trim();
    if (roomCodeInput === "") {
        alert("Please enter a room code to join a game.");
        return;
    }
    // Store the player's name in localStorage for later use
    fetch("/api/join-room", { 
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name: nameInput, roomCode: roomCodeInput })
    })
    .then(res => res.json())
    .then(data => {
      if(data.error) return alert(data.error);
      // Store the room code for later
      localStorage.setItem("roomCode", roomCodeInput);
      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("playerName", data.uniqueName);
      alert(`Joined room ${roomCodeInput} as ${data.uniqueName}`);
      // Redirect to lobby or game page
      window.location.href = "lobby.html";
    })
    .catch(err => console.error("Error joining room:", err));
});