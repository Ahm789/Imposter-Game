document.addEventListener("DOMContentLoaded", () => {

  const hintToggle = document.getElementById("hintToggle");
  const difficulty = document.getElementById("difficulty");
  const noImposters = document.getElementById("zimposters");
  const chance = document.getElementById("chance");
  const voting = document.getElementById("voting");
  const playersGroup = document.getElementById("playersGroup");
  const chatGroup = document.getElementById("chatGroup");
  const votingGroup = document.getElementById("votingGroup");

  const chatSelect = document.getElementById("chat");
  const chatSettings = document.getElementById("chatSettings");
  // ----- TAB LOGIC -----
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      const content = document.querySelector(`.tab-content[data-content="${target}"]`);
      if(content) content.classList.add("active");
    });
  });

  // Disable Online tab if not in online mode
  const onlineTabBtn = document.getElementById("onlineTabBtn");
  if(localStorage.getItem("onlineMode") !== "true") {
    onlineTabBtn.disabled = true;
    onlineTabBtn.title = "Enable Online Mode to access online settings";
  }

  // ----- SETTINGS LOGIC -----
  function updateDifficultyState() {
    if(hintToggle.value === "No") {
      difficulty.disabled = true;
      difficulty.classList.add("disabled-select");
    } else {
      difficulty.disabled = false;
      difficulty.classList.remove("disabled-select");
    }
  }
  function updateChatSettings() {
    if(chatSelect.value === "Yes") {
      // Enable all inputs inside chatSettings
      chatSettings.querySelectorAll("select").forEach(el => {
        el.disabled = false;
        el.classList.remove("disabled-select");
      });
    } else {
      // Disable all inputs inside chatSettings
      chatSettings.querySelectorAll("select").forEach(el => {
        el.disabled = true;
        el.classList.add("disabled-select");
      });
    }
  }
  function updateImposterChance() {
    if(noImposters.value === "No") {
      chance.disabled = true;
      chance.classList.add("disabled-select");
    } else {
      chance.disabled = false;
      chance.classList.remove("disabled-select");
    }
  }

  function updateVotingChat() {
  if (voting.value === "No") {
    // Disable all inputs inside chatGroup
    chatGroup.querySelectorAll("input, textarea, select, button").forEach(el => {
      el.disabled = true;
      el.classList.add("disabled-select");
    });

    // Also disable chatSettings
    chatSettings.querySelectorAll("select").forEach(el => {
      el.disabled = true;
      el.classList.add("disabled-select");
    });

  } else {
    // Enable all inputs inside chatGroup
    chatGroup.querySelectorAll("input, textarea, select, button").forEach(el => {
      el.disabled = false;
      el.classList.remove("disabled-select");
    });

    // Enable/disable chatSettings based on chat toggle
    if(chatSelect.value === "Yes") {
      chatSettings.querySelectorAll("select").forEach(el => {
        el.disabled = false;
        el.classList.remove("disabled-select");
      });
    } else {
      chatSettings.querySelectorAll("select").forEach(el => {
        el.disabled = true;
        el.classList.add("disabled-select");
      });
    }
  }
}

function onLoadSettings() {
  if (localStorage.getItem("onlineMode") === "true") {
    playersGroup.classList.add("hidden");
    votingGroup.classList.remove("hidden");

    // Enable chat inputs
    chatGroup.querySelectorAll("input, textarea, select, button").forEach(el => {
      el.disabled = false;
      el.classList.remove("disabled-select");
    });
  } else {
    playersGroup.classList.remove("hidden");
    votingGroup.classList.add("hidden");

    // Disable chat inputs
    chatGroup.querySelectorAll("input, textarea, select, button").forEach(el => {
      el.disabled = true;
      el.classList.add("disabled-select");
    });
  }
}

  // ----- INITIAL LOAD -----
  hintToggle.value = localStorage.getItem("hintToggle") || "Yes";
  difficulty.value = localStorage.getItem("difficulty") || "Medium";
  noImposters.value = localStorage.getItem("zimposters") || "No";
  chance.value = localStorage.getItem("chance") || "0.2";
  voting.value = localStorage.getItem("voting") || "No";
  document.getElementById("chat").value = localStorage.getItem("chat") || "No";
  document.getElementById("players").value = localStorage.getItem("players") || "3";
  document.getElementById("imposters").value = localStorage.getItem("imposters") || "1";
  document.getElementById("genre").value = localStorage.getItem("genre") || "Random";
  document.getElementById("public").value = localStorage.getItem("public") || "No";
  document.getElementById("wordLimit").value = localStorage.getItem("wordLimit") || "unlimited";
  document.getElementById("timeLimit").value = localStorage.getItem("timeLimit") || "unlimited";

  updateDifficultyState();
  updateImposterChance();
  onLoadSettings();
  updateChatSettings();
  updateVotingChat(); // must run last


  // ----- EVENT LISTENERS -----
  hintToggle.addEventListener("change", updateDifficultyState);
  noImposters.addEventListener("change", updateImposterChance);
  voting.addEventListener("change", updateVotingChat);
  chatSelect.addEventListener("change", updateChatSettings);

  // Save on Back
  document.getElementById("backBtn").addEventListener("click", async () => {
    const chatValue = document.getElementById("chat").value; // "Yes" or "No"
    const hstroomCode = sessionStorage.getItem("roomCode");
    const proomCode = localStorage.getItem("proomCode");
    const roomCode = hstroomCode || proomCode;
    const publicGame = document.getElementById("public").value; // "Yes" or "No"

    // Save locally
    localStorage.setItem("hintToggle", hintToggle.value);
    localStorage.setItem("difficulty", difficulty.value);
    localStorage.setItem("zimposters", noImposters.value);
    localStorage.setItem("chance", chance.value);
    localStorage.setItem("voting", voting.value);
    localStorage.setItem("chat", chatValue);
    localStorage.setItem("players", document.getElementById("players").value);
    localStorage.setItem("imposters", document.getElementById("imposters").value);
    localStorage.setItem("genre", document.getElementById("genre").value);
    localStorage.setItem("public", document.getElementById("public").value);
    localStorage.setItem("wordLimit", document.getElementById("wordLimit").value);
    localStorage.setItem("timeLimit", document.getElementById("timeLimit").value);

    // Send chat data to API
    if (roomCode) {
        try {
        const response = await fetch("/api/set-public", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            roomCode: roomCode,  // <--- Include this
            public: publicGame       // "Yes" or "No"
            }),
        });

        if (!response.ok) {
            console.error("Failed to send public status:", response.statusText);
        } else {
            console.log("Public status sent successfully");
        }
        } catch (err) {
        console.error("Error sending public status:", err);
        }
    } else {
        console.warn("No roomCode found, skipping public API call");
    }

    // Navigate to previous page
    const prevPage = localStorage.getItem("previousPage") || "game.html";
    window.location.href = prevPage;
    });

});