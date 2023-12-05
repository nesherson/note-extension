browser.contextMenus.create(
    {
        id: "save-text",
        title: "Save highlighted text",
        contexts: ["selection"],
    },
    () => { },
);

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "save-text") {
        browser.tabs.sendMessage(tab.id, { command: "save-text"});
    }
});

