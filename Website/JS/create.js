document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});
document.getElementById("hostBtn").addEventListener("click", () => {
  const nameInput = document.getElementById("nameInput").value.trim();
    if (nameInput === "") {
        alert("Please enter your name to create a game.");
        return;
    }
    // Store the player's name in localStorage for later use
    fetch("/api/create-room", { /*Send the user data in JSON to the API */
            method:"POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ name: nameInput})
          })
    .then(res => res.json())
    .then(data => {
      if(data.error) return alert(data.error);
      // Store the room code for later
      localStorage.setItem("roomCode", data.roomCode);
      // Redirect to lobby or game page
      localStorage.setItem("onlineMode", "true");
      window.location.href = "game.html";
      localStorage.setItem("hostId", data.hostId);
    })
    .catch(err => console.error("Error creating room:", err));
});