const hostBtn = document.getElementById("hostBtn");
const joinBtn = document.getElementById("joinBtn");
const localBtn = document.getElementById("localBtn");
const onlineMode = localStorage.getItem("onlineMode") === "true";

localBtn.addEventListener("click", () => {
  localStorage.setItem("onlineMode", "false")
  window.location.href = "game.html";
});

joinBtn.addEventListener("click", () => {
  window.location.href = "join.html";
});
hostBtn.addEventListener("click", () => {
  window.location.href = "create.html";
});