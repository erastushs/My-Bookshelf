const readingButton = document.querySelector(".reading-button");
const completeButton = document.querySelector(".complete-button");
const readingContainer = document.querySelector(".container-reading");
const completeContainer = document.querySelector(".container-complete");
const popup = document.querySelector(".popup-add-book");
const popupButton = document.querySelector(".add-book");
const cancelButton = document.querySelector(".cancel-button");
const search = document.querySelector("#search-input");
const addClose = document.querySelector(".add-close");
const edit = document.querySelectorAll(".edit");
const del = document.querySelectorAll(".delete");
const complete = document.querySelectorAll(".complete");
const reading = document.querySelectorAll(".reading");
const popupDel = document.querySelector(".popup-delete-container");
const cancelDel = document.querySelector(".cancel-del");
const delClose = document.querySelector(".del-close");
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
const books = [];
const RENDER_EVENT = "render-book";

readingButton.addEventListener("click", function () {
  readingButton.classList.add("active");
  completeButton.classList.remove("active");

  readingContainer.removeAttribute("hidden");
  completeContainer.setAttribute("hidden", true);

  document.dispatchEvent(new Event(RENDER_EVENT));
});
completeButton.addEventListener("click", function () {
  completeButton.classList.add("active");
  readingButton.classList.remove("active");

  completeContainer.removeAttribute("hidden");
  readingContainer.setAttribute("hidden", true);

  document.dispatchEvent(new Event(RENDER_EVENT));
});

popupButton.addEventListener("click", function () {
  popup.classList.add("active");
});
cancelButton.addEventListener("click", function () {
  clearInput();
});
addClose.addEventListener("click", function () {
  clearInput();
});

cancelDel.addEventListener("click", function () {
  popupDel.classList.remove("active");
});
delClose.addEventListener("click", function () {
  popupDel.classList.remove("active");
});

function generateBookObject(id, title, author, realese, isCompleted) {
  return {
    id,
    title,
    author,
    realese,
    isCompleted,
  };
}

search.addEventListener("keyup", function (e) {
  const searchList = e.target.value.toLowerCase();
  let itemList = document.querySelectorAll(".info");

  itemList.forEach((item) => {
    const isiItem = item.firstChild.textContent.toLowerCase();

    if (isiItem.indexOf(searchList) != -1) {
      item.parentElement.setAttribute("style", "display: block");
    } else {
      item.parentElement.setAttribute("style", "display: none !important");
    }
  });
});

function generateId() {
  return +new Date();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Your browser does not support local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  const generatedID = generateId();
  const titleField = document.getElementById("title-field").value;
  const authorField = document.getElementById("author-field").value;
  const realese = document.getElementById("year-field").value;
  const isCompleted = document.getElementById("finished-read-checkbox").checked;
  const bookObject = generateBookObject(generatedID, titleField, authorField, realese, isCompleted, false);
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function clearInput() {
  const inputs = document.querySelectorAll("input");

  popup.classList.remove("active");
  inputs.forEach((input) => {
    input.value = "";
  });
}

function addBook() {
  const generatedID = generateId();
  const titleField = document.getElementById("title-field").value;
  const authorField = document.getElementById("author-field").value;
  const realese = document.getElementById("year-field").value;
  const isCompleted = document.getElementById("finished-read-checkbox").checked;
  const bookObject = generateBookObject(generatedID, titleField, authorField, realese, isCompleted, false);
  books.push(bookObject);
  alert(`Successfully Added ${bookObject.title}`);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    clearInput();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addTitleToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function removeTitleFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function readingTitleFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h4");
  textTitle.classList.add("title");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.classList.add("author");
  textAuthor.innerText = `Author: ${bookObject.author}`;

  const textRealease = document.createElement("p");
  textRealease.classList.add("publised-year");
  textRealease.innerText = `Publised Year: ${bookObject.realese}`;

  const textContainer = document.createElement("div");
  textContainer.classList.add("info");
  textContainer.append(textTitle, textAuthor, textRealease);

  const delLogo = document.createElement("i");
  delLogo.classList.add("fa-solid", "fa-trash");
  const delAction = document.createElement("button");
  delAction.classList.add("delete");
  delAction.append(delLogo);
  const delConfirm = document.querySelector(".ok-del");

  delAction.addEventListener("click", function () {
    popupDel.classList.add("active");

    delConfirm.addEventListener("click", function () {
      const confirm = true;

      if (confirm) {
        console.log(bookObject.id);
        removeTitleFromCompleted(bookObject.id);
        popupDel.classList.remove("active");
      }
    });
  });

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("actions");

  const container = document.createElement("li");
  container.append(textContainer, actionContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const readingAction = document.createElement("button");
    readingAction.classList.add("reading");
    readingAction.innerText = "Move to Reading";
    actionContainer.append(delAction, readingAction);

    readingAction.addEventListener("click", function () {
      readingTitleFromCompleted(bookObject.id);
    });
  } else {
    const completeAction = document.createElement("button");
    completeAction.classList.add("complete");
    completeAction.innerText = "Move to Complete";

    actionContainer.append(delAction, completeAction);

    completeAction.addEventListener("click", function () {
      addTitleToCompleted(bookObject.id);
    });
  }

  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  const readingList = document.getElementById("book-list-reading");
  readingList.innerHTML = "";

  const completeList = document.getElementById("book-list-complete");
  completeList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) readingList.append(bookElement);
    else completeList.append(bookElement);
  }

  search.value = "";
});
