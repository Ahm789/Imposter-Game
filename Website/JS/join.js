document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});
document.getElementById("joinBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("nameInput").value.trim();
    if (nameInput === "") {
      document.getElementById("errors").style.display = "block";
      document.getElementById("error").textContent = "Please enter your name to create a game.";
      setTimeout(() => {
        document.getElementById("errors").style.display = "none";
      }, 3000); // 3000ms = 3 seconds
        return;
    }
    const roomCodeInput = document.getElementById("roomCodeInput").value.trim();
    if (roomCodeInput === "") {
      document.getElementById("errors").style.display = "block";
      document.getElementById("error").textContent = "Please enter a room code to join a game.";
      setTimeout(() => {
        document.getElementById("errors").style.display = "none";
      }, 3000); // 3000ms = 3 seconds
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
      if(data.error) return console.log(data.error);
      // Store the room code for later
      localStorage.setItem("proomCode", roomCodeInput);
      localStorage.setItem("hostName", "")
      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("playerName", data.uniqueName);
      localStorage.setItem("onlineMode", "true");
      // Redirect to lobby or game page
      window.location.href = "lobby.html";
    })
    .catch(err => console.error("Error joining room:", err));
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
});