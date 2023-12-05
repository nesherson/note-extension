(() => {
  if (window.hasRun) return;

  window.hasRun = true;

  browser.runtime.onMessage.addListener((data, sender) => {
    console.log("test_popup.js");
    document.body.style.border = "2px solid red";
  });
})();

