browser.contextMenus.create(
    {
        id: "save-highlighted-text",
        title: "Save highlighted text",
        contexts: ["selection"],
    },
    onCreate,
);

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "save-highlighted-text") {
        await browser.tabs.sendMessage(tab.id, { command: "save-highlighted-text" });
    }
});

browser.commands.onCommand.addListener(async (command) => {
    if (command === "save-highlighted-text") {
        const tabs = await browser.tabs.query({ active: true, windowId: browser.windows.WINDOW_ID_CURRENT });
        await browser.tabs.sendMessage(tabs[0].id, { command: "save-highlighted-text" });
    }
});

function onCreate() {
    console.log("Context menu item created");
}

