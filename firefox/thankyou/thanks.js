const api = typeof browser !== "undefined" ? browser : chrome;

document.addEventListener("DOMContentLoaded", () => {
  const githubBtn = document.getElementById("githubBtn");

  if (githubBtn) {
    githubBtn.addEventListener("click", () => {
      api.tabs.create({
        url: "https://github.com/cBucnaru8433/Cookie_Recipe"
      });
    });
  }
});