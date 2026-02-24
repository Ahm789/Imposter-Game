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
