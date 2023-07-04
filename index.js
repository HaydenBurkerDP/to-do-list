const itemTemplate = document
  .getElementsByTagName("template")[0]
  .content.querySelector("div");

const [listElement, completedListElement] =
  document.getElementsByClassName("item-list");
const createItemButton = document.getElementsByClassName("create-item-btn")[0];
createItemButton.disabled = true;
const createItemTextInput = document.getElementById("create-item-text");

const emptyListMessage = document.createElement("h3");
emptyListMessage.className = "empty-item";
emptyListMessage.textContent = "No pending to-dos found";
listElement.appendChild(emptyListMessage);

const emptyCompletedListMessage = document.createElement("h3");
emptyCompletedListMessage.className = "empty-item";
emptyCompletedListMessage.textContent = "No completed to-dos found";
completedListElement.appendChild(emptyCompletedListMessage);

const nodeItemsMap = new Map();

loadItems();
window.onbeforeunload = saveItems;

function saveItems() {
  itemsToSave = [];
  for (const child of listElement.children) {
    const itemData = nodeItemsMap.get(child);
    if (itemData) {
      itemsToSave.push(itemData);
    }
  }
  localStorage.setItem("to-dos", JSON.stringify(itemsToSave));
}

function loadItems() {
  if (nodeItemsMap.size > 0) {
    return;
  }

  let itemsToLoad = JSON.parse(localStorage.getItem("to-dos"));

  if (!itemsToLoad) {
    return;
  }

  for (const itemData of itemsToLoad) {
    createItem(itemData.text, itemData.checked);
  }
}

function getItemText(item) {
  return item.querySelector(".item-text");
}

function getItemCheckbox(item) {
  return item.querySelector(".check-item");
}

function getItemDeleteButton(item) {
  return item.querySelector(".delete-item");
}

function hasCompletedItems() {
  for (const itemData of nodeItemsMap.values()) {
    if (itemData.checked) {
      return true;
    }
  }
  return false;
}

function updateEmptyMessages() {
  if (nodeItemsMap.size === 0) {
    listElement.appendChild(emptyListMessage);
  } else if (emptyListMessage.parentElement) {
    emptyListMessage.parentElement.removeChild(emptyListMessage);
  }

  if (!hasCompletedItems()) {
    completedListElement.appendChild(emptyCompletedListMessage);
  } else if (emptyCompletedListMessage.parentElement) {
    emptyCompletedListMessage.parentElement.removeChild(
      emptyCompletedListMessage
    );
  }
}

function createItem(text, checked) {
  let itemData = { text: text, checked: checked };
  let item = document.importNode(itemTemplate, true);
  nodeItemsMap.set(item, itemData);

  let completedItem = document.importNode(itemTemplate, true);
  for (const child of completedItem.children) {
    if (child !== getItemText(completedItem)) {
      completedItem.removeChild(child);
    }
  }

  listElement.appendChild(item);

  if (itemData.checked) {
    completedListElement.appendChild(completedItem);
  }

  updateEmptyMessages();

  let itemText = getItemText(item);
  let itemCheckbox = getItemCheckbox(item);
  itemCheckbox.checked = checked;
  itemText.innerText = text;
  getItemText(completedItem).innerText = text;

  const addCompletedItem = () => {
    let i = 0;
    for (const child of listElement.children) {
      let checked = nodeItemsMap.get(child)?.checked;
      if (child === item) {
        completedListElement.insertBefore(
          completedItem,
          completedListElement.children[i]
        );
      }
      if (checked) {
        i++;
      }
    }
  };

  const checkboxChange = (e) => {
    itemData.checked = e.target.checked;

    itemData.checked
      ? addCompletedItem()
      : completedListElement.removeChild(completedItem);
    updateEmptyMessages();
  };

  const deleteItemClick = (e) => {
    item.parentElement.removeChild(item);
    completedItem.parentElement?.removeChild(completedItem);
    item.removeEventListener("click", deleteItemClick);
    itemCheckbox.removeEventListener("change", checkboxChange);
    nodeItemsMap.delete(item);
    updateEmptyMessages();
  };

  itemCheckbox.addEventListener("change", checkboxChange);
  getItemDeleteButton(item).addEventListener("click", deleteItemClick);
}

createItemButton.addEventListener("click", () => {
  const text = createItemTextInput.value;
  createItem(text, false);

  createItemTextInput.value = "";
  createItemButton.disabled = true;
});

createItemTextInput.addEventListener("keyup", () => {
  createItemButton.disabled = createItemTextInput.value.trim().length === 0;
});
