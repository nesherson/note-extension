window.onload = async () => {
    await setup();
};

async function setup() {
    const popupBody = document.getElementById("popup-body");

    const data = await browser.storage.local.get("textItems");
    if (data?.textItems?.length > 0) {
        data.textItems.forEach((textItem) => {
            const textEl = createTextItemElement(textItem);
            popupBody.appendChild(textEl);
        });
    }

    toggleNoContentIndicator();

    document.getElementById("reset").onclick = resetListOnClick;
    document.getElementById("btn-more-options").onclick = showMoreOptionsPopup;
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
    const itemText = document.createElement("p");
    const btnEdit = document.createElement("button");
    const btnDelete = document.createElement("button");
    const btnSend = document.createElement("button");

    textListItem.classList.add("text-list-item");
    btnDelete.classList.add("text-list-item-btn", "btn-delete");
    btnSend.classList.add("text-list-item-btn", "btn-send");
    btnEdit.classList.add("text-list-item-btn", "btn-edit");

    textListItem.setAttribute("id", textItem.id);
    const truncObj = truncate(textItem.text, 180);
    itemText.textContent = truncObj.text;

    if (truncObj.isTruncated) itemText.setAttribute("title", textItem.text);

    btnDelete.textContent = "Delete";
    btnSend.textContent = "Send";
    btnEdit.textContent = "Edit";

    btnDelete.onclick = () => deleteTextItem(textItem.id);
    btnEdit.onclick = () => editTextItem(textItem.id);
    btnSend.onclick = () => sendTextItemToNotion(textItem.id);

    textListItem.appendChild(itemText);
    textListItem.appendChild(btnSend);
    textListItem.appendChild(btnEdit);
    textListItem.appendChild(btnDelete);

    return textListItem;
}

async function resetListOnClick() {
    const popupBody = document.getElementById("popup-body");

    while (popupBody.hasChildNodes())
        popupBody.removeChild(popupBody.firstChild);

    toggleNoContentIndicator();

    await browser.storage.local.remove("textItems");
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
    const data = await browser.storage.local.get("textItems");
    const isTruncated = false;
    const storedTextItems = data.textItems;
    const storedTextItemToEdit = storedTextItems.find(
        (ti) => ti.id === textItemId
    );
    const textItem = document.getElementById(textItemId);
    const input = textItem.firstChild;

    storedTextItemToEdit.text = input.value;

    await browser.storage.local.set({ textItems: storedTextItems });
    textItem.removeChild(textItem.firstChild);
    textItem.removeChild(textItem.firstChild);

    const paragraph = document.createElement("p");
    const editButton = document.createElement("button");

    const truncObj = truncate(input.value, 180, isTruncated);
    paragraph.textContent = truncObj.text;

    if (truncObj.isTruncated) paragraph.setAttribute("title", input.value);

    editButton.textContent = "Edit";
    editButton.classList.add("text-list-item-btn", "btn-edit");
    editButton.onclick = () => editTextItem(textItem.id);

    textItem.prepend(editButton);
    textItem.prepend(paragraph);
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
