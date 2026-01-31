const dateEl = document.getElementById("datetime");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const themeToggle = document.getElementById("themeToggle");

const homeLink = document.getElementById("homeLink");

function isLoggedIn() {
  return localStorage.getItem("carr15_auth") === "true";
}

function requireLogin(path) {
  if (isLoggedIn()) {
    window.location.href = path;
  } else {
    window.location.href = "/login/";
  }
}

function updateTime() {
  const now = new Date();
  dateEl.textContent = now.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  });
}
setInterval(updateTime, 1000);
updateTime();

menuBtn.onclick = () => {
  menu.classList.toggle("hidden");
};

themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
};

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.setAttribute("data-theme", "dark");
}

document.querySelectorAll(".member-header").forEach(btn => {
  btn.onclick = () => {
    const body = btn.nextElementSibling;
    body.style.display = body.style.display === "flex" ? "none" : "flex";
  };
});

document.querySelectorAll(".visit").forEach(btn => {
  btn.onclick = e => {
    const profilePath = e.target.closest(".member").dataset.profile;
    requireLogin(profilePath);
  };
});

if (homeLink) {
  homeLink.addEventListener("click", event => {
    event.preventDefault();
    requireLogin("/home/");
  });
}
