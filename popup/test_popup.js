window.onload = async () => {
    await setup();
};

async function setup() {
    await loadTextItems();
    toggleNoContentIndicator();
    setupFooterButtons();

    document.querySelector("#popup-container").onclick = (e) => {
        const moreOptionsPopup = document.querySelector("#more-options-popup");
        if (moreOptionsPopup &&
            e.target.id !== "btn-more-options" &&
            e.target.id !== "more-options-popup" &&
            moreOptionsPopup.classList.contains("show")) {
                moreOptionsPopup.classList.remove("show");
            }
    }
}

async function loadTextItems() {
    const popupBody = document.querySelector("#popup-body");
    const data = await browser.storage.local.get("textItems");
    if (data?.textItems?.length > 0) {
        data.textItems.forEach((textItem) => {
            const textEl = createTextItemElement(textItem);
            popupBody.appendChild(textEl);
        });
    }
}

function setupFooterButtons() {
    document.getElementById("btn-remove-all").onclick = resetListOnClick;
    document.getElementById("btn-send-all").onclick = () => console.log("Send all");
}

async function toggleNoContentIndicator() {
    // const noContent = document.getElementById("no-content");
    // const data = await browser.storage.local.get("textItems");

    // if (data?.textItems?.length > 0) {
    //     noContent.classList.add("hidden");
    // }
    // else {
    //     noContent.classList.remove("hidden");
    // }
}

function createTextItemElement(textItem) {
    const textListItem = document.createElement("div");
    const textListItemLeft = document.createElement("div");
    const textListItemRight = document.createElement("div");
    const itemText = document.createElement("p");
    const btnEdit = document.createElement("button");
    const btnDelete = document.createElement("button");
    const btnSend = document.createElement("button");
    const btnMoreOptions = document.createElement("button");
    const divMoreOptionsPopup = document.createElement("div");
    const imgMoreOptions = document.createElement("img");
    const unorderedList = document.createElement("ul");
    const unorderedListItemSend = document.createElement("li");
    const unorderedListItemEdit = document.createElement("li");
    const unorderedListItemDelete = document.createElement("li");
    const imgOptionsSend = document.createElement("img");
    const imgOptionsEdit = document.createElement("img");
    const imgOptionsDelete = document.createElement("img");
    const spanOptionsSend = document.createElement("span");
    const spanOptionsEdit = document.createElement("span");
    const spanOptionsDelete = document.createElement("span");

    textListItem.classList.add("text-list-item");
    btnDelete.classList.add("text-list-item-btn", "btn-delete");
    btnSend.classList.add("text-list-item-btn", "btn-send");
    btnEdit.classList.add("text-list-item-btn", "btn-edit");
    textListItemLeft.classList.add("text-list-item-left");
    textListItemRight.classList.add("text-list-item-right");
    btnMoreOptions.classList.add("btn-more-options");
    divMoreOptionsPopup.classList.add("more-options-popup");
    imgMoreOptions.classList.add("btn-more-options-img");

    const truncObj = truncate(textItem.text, 180);
    itemText.textContent = truncObj.text;

    if (truncObj.isTruncated)
        itemText.setAttribute("title", textItem.text);

    textListItem.setAttribute("id", textItem.id);
    divMoreOptionsPopup.setAttribute("id", "more-options-popup");
    imgMoreOptions.setAttribute("src", "../icons/more-vertical.svg");
    imgOptionsSend.setAttribute("src", "../icons/send.svg");
    imgOptionsEdit.setAttribute("src", "../icons/edit.svg");
    imgOptionsDelete.setAttribute("src", "../icons/delete.svg");
    btnMoreOptions.setAttribute("id", "btn-more-options");

    btnDelete.textContent = "Delete";
    btnSend.textContent = "Send";
    btnEdit.textContent = "Edit";
    spanOptionsSend.textContent = "Send";
    spanOptionsEdit.textContent = "Edit";
    spanOptionsDelete.textContent = "Delete";

    unorderedListItemSend.onclick = () => sendTextItemToNotion(textItem.id);
    unorderedListItemEdit.onclick = () => editTextItem(textItem.id);
    unorderedListItemDelete.onclick = () => deleteTextItem(textItem.id);
    btnMoreOptions.onclick = showMoreOptionsPopup;

    unorderedListItemSend.appendChild(imgOptionsSend);
    unorderedListItemSend.appendChild(spanOptionsSend);
    unorderedListItemEdit.appendChild(imgOptionsEdit);
    unorderedListItemEdit.appendChild(spanOptionsEdit);
    unorderedListItemDelete.appendChild(imgOptionsDelete);
    unorderedListItemDelete.appendChild(spanOptionsDelete);

    unorderedList.appendChild(unorderedListItemSend);
    unorderedList.appendChild(unorderedListItemEdit);
    unorderedList.appendChild(unorderedListItemDelete);

    divMoreOptionsPopup.appendChild(unorderedList);

    btnMoreOptions.appendChild(imgMoreOptions);
    textListItemRight.appendChild(btnMoreOptions);
    textListItemRight.appendChild(divMoreOptionsPopup);

    textListItemLeft.appendChild(itemText);

    textListItem.appendChild(textListItemLeft);
    textListItem.appendChild(textListItemRight);

    return textListItem;
}

async function resetListOnClick() {
    removeAllTextItems();
    await browser.storage.local.remove("textItems");
}

async function removeAllTextItems() {
    const popupBody = document.getElementById("popup-body");

    while (popupBody.hasChildNodes())
        popupBody.removeChild(popupBody.firstChild);

    toggleNoContentIndicator();

}

async function deleteTextItem(textItemId) {
    const data = await browser.storage.local.get("textItems");
    const newTextItems = data.textItems.filter((ti) => ti.id !== textItemId);

    await browser.storage.local.set({ textItems: newTextItems });

    const itemToDelete = document.getElementById(textItemId);
    itemToDelete.remove();
    toggleNoContentIndicator();
}

async function editTextItem(textItemId) {
    const data = await browser.storage.local.get("textItems");
    const textItemToEdit = data.textItems.find((ti) => ti.id === textItemId);
    const textItem = document.getElementById(textItemId);
    const existingTextContent = textItemToEdit.text;

    textItem.removeChild(textItem.firstChild);
    textItem.removeChild(textItem.firstChild);

    const textArea = document.createElement("textarea");
    const saveButton = document.createElement("button");

    textArea.classList.add("text-list-item-input");
    textArea.value = existingTextContent;
    saveButton.textContent = "Save";
    saveButton.classList.add("text-list-item-btn", "btn-edit");
    saveButton.onclick = async () => await saveEditedTextItem(textItemId);

    textItem.prepend(saveButton);
    textItem.prepend(textArea);
}

async function saveEditedTextItem(textItemId) {
    const storedTextItems = await getTextItems();
    const storedTextItemToEdit = storedTextItems.find(
        (ti) => ti.id === textItemId
    );
    const textItem = document.getElementById(textItemId);
    const input = textItem.firstChild;

    storedTextItemToEdit.text = input.value;

    await browser.storage.local.set({ textItems: storedTextItems });

    removeAllTextItems();
    loadTextItems();
}

async function getTextItems() {
    const data = await browser.storage.local
        .get("textItems").textItems;
}

function truncate(str, n) {
    const trunc = {
        text: str,
        isTruncated: false,
    };

    if (str.length > n) {
        trunc.isTruncated = true;
        trunc.text = str.slice(0, n - 1) + "...";

        return trunc;
    }

    return trunc;
}

async function sendTextItemToNotion(textItemId) {
    const data = await browser.storage.local.get("textItems");
    const textItem = data.textItems.find((ti) => ti.id === textItemId);

    const body = JSON.stringify({
        text: textItem.text,
    });

    const response = await fetch("http://localhost:10000/add-note", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body
    });
}

function showMoreOptionsPopup() {
    const popup = document.getElementById("more-options-popup");
    popup.classList.toggle("show");
}

/*
<div class="text-list-item">
      <p></p>
      <button class="item-btn-edit">Edit</button>
      <button class="item-btn-delete">Delete</button>
      <button class="item-btn-send">Send</button>
    </div>
*/
