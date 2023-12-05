document.title = "Test";

browser.runtime.onMessage.addListener((request) => {
    if (request.command === "save-text") {
        const selectedText = getSelectedText();
        saveTextToStorage(selectedText);
    }

    return Promise.resolve({ response: "Hi from content script" });
});

function getSelectedText() {
    const selection = window.getSelection();
    if (selection.anchorNode.textContent === "") return;

    let selectedText = "";
    let anchorOffset = selection.anchorOffset;
    let focusOffset = selection.focusOffset;

    const anchorNodeTextContent = selection.anchorNode.textContent;
    const focusNodeTextContent = selection.focusNode.textContent;

    // console.log("getSelectedText/selection -> ", selection);

    if (
        selection.anchorNode.nextSibling === selection.focusNode.parentElement
    ) {
        const textLengthTillNextNode =
            anchorNodeTextContent.length - anchorOffset;
        const allText = anchorNodeTextContent.concat(focusNodeTextContent);

        selectedText = allText.slice(
            anchorOffset,
            anchorOffset + textLengthTillNextNode + focusOffset
        );
    } else {
        if (selection.anchorOffset > selection.focusOffset &&
            selection.anchorNode.parentElement === selection.focusNode.parentElement) {
            const textLengthTillNextNode =
                anchorNodeTextContent.length - anchorOffset;
            const anchorNodeWithNextSiblingTextContent = anchorNodeTextContent.concat(
                selection.anchorNode.nextSibling.textContent
            );

            const allText = anchorNodeWithNextSiblingTextContent.concat(selection.focusNode.textContent.slice(0, focusOffset));

            selectedText = allText.slice(
                anchorOffset,
                anchorOffset +
                textLengthTillNextNode +
                selection.anchorNode.nextSibling.textContent.length +
                focusOffset
            );

            // console.log("getSelectedText/selectedText -> ", selectedText);

            return selectedText;
        }
        else if (selection.anchorNode.parentElement === selection.focusNode.parentElement) {
            selectedText = anchorNodeTextContent.slice(selection.anchorOffset, selection.focusOffset);
            // console.log("getSelectedText/selectedText -> ", selectedText);
            return selectedText;
        }
    }

    // console.log("getSelectedText/selectedText -> ", selectedText);

    return selectedText;
}

function saveTextToStorage(text) {
    let existingTextItems = [];

    const newTextItem = createTextItem(text);

    browser.storage.local.get("textItems")
        .then(data => {
            if (data?.textItems?.length > 0) {
                existingTextItems = data.textItems.slice();
                existingTextItems.push(newTextItem);
                browser.storage.local.set({ textItems: existingTextItems });
            }
            else {
                existingTextItems.push(newTextItem);
                browser.storage.local.set({ textItems: existingTextItems });
            }
        });
}

function createTextItem(text) {
    return {
        id: crypto.randomUUID(),
        text: text,
        isSent: false
    }
}
