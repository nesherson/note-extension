window.onload = () => {
    setup();
}

function setup() {
    const popupBody = document.getElementById("popup-body");

    browser.storage.local.get("textItems")
        .then((data) => {
            if (data?.textItems?.length > 0) {
                data.textItems.forEach(textItem => {
                    const textEl = createTextItemElement(textItem);
                    popupBody.appendChild(textEl);
                });
            }

            if (!popupBody.hasChildNodes()) {
                toggleNoContentIndicator(true);
            }

        });

    document.getElementById("reset").onclick = resetListOnClick;
}

function toggleNoContentIndicator(showIndicator) {
    const noContent = document.getElementById("no-content");

    if (showIndicator)
        noContent.classList.add("hidden");
    else
        noContent.classList.remove("hidden");
}

function createTextItemElement(textItem) {
    const textListItem = document.createElement("div");
    const itemText = document.createElement("p");
    const btnDelete = document.createElement("button");
    const btnSend = document.createElement("button");

    textListItem.classList.add("text-list-item");
    btnDelete.classList.add("item-btn-delete");
    btnSend.classList.add("item-btn-send");

    textListItem.setAttribute("id", textItem.id);
    itemText.textContent = textItem.text;
    btnDelete.textContent = "Delete";
    btnSend.textContent = "Send";

    btnDelete.onclick = () => deleteTextItem(textItem.id);

    textListItem.appendChild(itemText);
    textListItem.appendChild(btnDelete);
    textListItem.appendChild(btnSend);

    return textListItem;
}

function resetListOnClick() {
    const popupBody = document.getElementById("popup-body");

    while (popupBody.hasChildNodes())
        popupBody.removeChild(popupBody.firstChild);

    toggleNoContentIndicator(false);

    browser.storage.local.remove("textItems");
}

function deleteTextItem(textItemId) {
    browser.storage.local.get("textItems")
        .then((data) => {
            const newTextItems = data.textItems.filter(ti => ti.id !== textItemId);

            browser.storage.local.set({ textItems: newTextItems });

            const itemToDelete = document.getElementById(textItemId);
            itemToDelete.remove();
        });
}

/*
<div class="text-list-item">
      <p class="item-text"></p>
      <button class="item-btn-delete">Delete</button>
      <button class="item-btn-send">Send</button>
    </div>
*/
