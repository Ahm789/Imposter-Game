document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});
const tabs = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {

    tabs.forEach(t => t.classList.remove("active"));
    contents.forEach(c => c.classList.remove("active"));

    tab.classList.add("active");

    const target = document.getElementById(tab.dataset.tab);
    target.classList.add("active");

  });
});
async function loadActiveRooms() {

  try {

    const res = await fetch("/api/active-rooms");
    const rooms = await res.json();

    const container = document.getElementById("roomsList");
    container.innerHTML = "";

    if (rooms.length === 0) {
      container.innerHTML = "<p class='p-muted'>No active rooms</p>";
      return;
    }

    rooms.forEach(room => {

      const btn = document.createElement("button");
      btn.className = "main-btn";
      btn.textContent = `Room ${room}`;

      btn.onclick = () => {
        document.getElementById("roomCodeInput").value = room;
        document.querySelector('[data-tab="joinTab"]').click();
      };

      container.appendChild(btn);

    });

  } catch (err) {
    console.error("Failed to load rooms", err);
  }

}
loadActiveRooms();
setInterval(loadActiveRooms, 1000);
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
      if (data.error) {
        // Show error if server returns an error
        document.getElementById("errors").style.display = "block";
        document.getElementById("error").textContent = "You have entered the wrong room code";
        setTimeout(() => {
          document.getElementById("errors").style.display = "none";
        }, 5000);
        return; // stop execution
      }
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