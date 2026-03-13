document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});
document.getElementById("hostBtn").addEventListener("click", async () => {
  const nameInput = document.getElementById("nameInput").value.trim();
    if (nameInput === "") {
        document.getElementById("rhostName").style.display = "block";
        document.getElementById("error").textContent = "Please enter your name to create a game.";
        setTimeout(() => {
        document.getElementById("rhostName").style.display = "none";
      }, 3000); // 3000ms = 3 seconds
        return;
    }
    // Store the player's name in localStorage for later use
    try {
      const createRes = await fetch("/api/create-room", {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name: nameInput})
      });
      const data = await createRes.json();

      if (data.error) return console.log(data.error);

      // Save session/local data
      sessionStorage.setItem("roomCode", data.roomCode);
      localStorage.setItem("onlineMode", "true");
      localStorage.setItem("hostId", data.hostId);
      localStorage.setItem("hostName", data.name);

      // Send chat to API
      const chatValue = localStorage.getItem("chat") || "No";
      const roomCode = data.roomCode; // use the newly created room code

      const chatRes = await fetch("/api/set-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, chat: chatValue })
      });

      if (!chatRes.ok) {
        console.error("Failed to send chat status:", chatRes.statusText);
      } else {
        console.log("Chat status sent successfully");
      }

      // Redirect
      window.location.href = "game.html";

    } catch(err) {
      console.error("Error creating room or sending chat:", err);
    }
});