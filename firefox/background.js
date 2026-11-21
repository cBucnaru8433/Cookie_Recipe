const api = typeof browser !== "undefined" ? browser : chrome;

api.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    api.tabs.create({
      url: api.runtime.getURL("thankyou/thanks.html")
    });
  }
});