const debug = new URLSearchParams(window.location.search).get("debug") === "1";
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body = document.body;
const pageType = body.dataset.page || "public";
const startUnlocked = body.dataset.start === "unlocked";

const answerForm = document.getElementById("answerForm");
const inputs = Array.from(document.querySelectorAll("input[data-index]"));
const feedback = document.getElementById("feedback");
const hint = document.getElementById("hint");
const continueLink = document.getElementById("continueLink");
const tileArea = document.getElementById("tileArea");
const tileGrid = document.getElementById("tileGrid");
const swapFrom = document.getElementById("swapFrom");
const swapTo = document.getElementById("swapTo");
const swapButton = document.getElementById("swapButton");
const pawPrints = document.getElementById("pawPrints");
const bearBadge = document.getElementById("bearBadge");
const dadTooltip = document.getElementById("dadTooltip");
const collage = document.getElementById("collage");
const collageGrid = document.getElementById("collageGrid");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.querySelector(".modal-close");
const modalPrev = document.getElementById("modalPrev");
const modalNext = document.getElementById("modalNext");
const actionBadge = document.getElementById("actionBadge");
const chapterButtons = document.querySelectorAll(".chapter-card");

const correctWords = ["crazy", "girl", "gracie", "bear"];
// Locked/unlocked state machine + attempt counter (reset on unlock).
let attempts = 0;
let isUnlocked = false;
let tiles = [];
let activeChapter = null;
let activeIndex = 0;
let chapterData = null;

if (prefersReducedMotion) {
  body.classList.add("reduce-motion");
}

const debugLog = (...args) => {
  if (debug) {
    console.log("[grace]", ...args);
  }
};

const normalize = value => value.trim().toLowerCase();

const updateFeedback = message => {
  if (feedback) {
    feedback.textContent = message;
  }
};

const updateHint = () => {
  if (!hint) return;
  if (attempts >= 5) {
    hint.hidden = false;
    hint.textContent = "Hint: Two words from a bedtime song; two words from a childhood nickname. (Hint: the song was by the Eli Young Band.)";
  } else {
    hint.hidden = true;
  }
};

const validateInputs = () => {
  const values = inputs.map(input => normalize(input.value));
  const correct = values.every((value, index) => value === correctWords[index]);
  debugLog("validation", values, correct);
  return { values, correct };
};

// Locked -> unlocked transition (triggers shatter/fade + reveals chapters).
const unlock = ({ skipAnimation = false } = {}) => {
  isUnlocked = true;
  attempts = 0;
  updateFeedback("Unlocked. The chapters are ready.");
  updateHint();
  body.classList.add("is-unlocked");
  if (skipAnimation) {
    body.classList.add("reduce-motion");
  }
  if (continueLink) {
    continueLink.hidden = false;
  }
  if (answerForm) {
    answerForm.hidden = true;
  }
  if (tileArea) {
    tileArea.hidden = false;
  }

  const sourceWords = inputs.length ? inputs.map(input => input.value.trim() || "") : correctWords;
  initializeTiles(sourceWords);
};

const initializeTiles = words => {
  tiles = words.map((word, index) => ({ id: index, word: word || correctWords[index] }));
  renderTiles();
  populateSwapControls();
  evaluatePhrases();
};

const renderTiles = () => {
  if (!tileGrid) return;
  tileGrid.innerHTML = "";
  tiles.forEach((tile, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile";
    button.textContent = tile.word;
    button.draggable = true;
    button.dataset.index = index;
    button.setAttribute("role", "listitem");

    button.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", String(index));
      event.dataTransfer.effectAllowed = "move";
    });

    button.addEventListener("dragover", event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    button.addEventListener("drop", event => {
      event.preventDefault();
      const fromIndex = Number(event.dataTransfer.getData("text/plain"));
      const toIndex = Number(button.dataset.index);
      swapTiles(fromIndex, toIndex);
    });

    tileGrid.appendChild(button);
  });
};

const populateSwapControls = () => {
  if (!swapFrom || !swapTo) return;
  [swapFrom, swapTo].forEach(select => {
    select.innerHTML = "";
    tiles.forEach((tile, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${index + 1}: ${tile.word}`;
      select.appendChild(option);
    });
  });
};

const swapTiles = (fromIndex, toIndex) => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
  const temp = tiles[fromIndex];
  tiles[fromIndex] = tiles[toIndex];
  tiles[toIndex] = temp;
  debugLog("swap", fromIndex, toIndex, tiles.map(tile => tile.word));
  renderTiles();
  populateSwapControls();
  evaluatePhrases();
};

// Phrase detection: recompute row phrases after any arrangement change.
const evaluatePhrases = () => {
  if (!tiles.length) return;
  const words = tiles.map(tile => normalize(tile.word));
  const rowOne = `${words[0]} ${words[1]}`.trim();
  const rowTwo = `${words[2]} ${words[3]}`.trim();
  debugLog("phrases", rowOne, rowTwo);
  // Action map for two-word phrases (row 1 or row 2).
  const phraseActions = {
    "crazy bear": triggerPawPrints,
    "bear gracie": showBearBadge,
    "gracie crazy": highlightDadPov,
    "gracie girl": showCollagePreview
  };

  [rowOne, rowTwo].forEach(phrase => {
    const action = phraseActions[phrase];
    if (action) {
      action();
    }
  });
};

const triggerPawPrints = () => {
  body.classList.remove("paw-active");
  void pawPrints.offsetWidth;
  body.classList.add("paw-active");
  actionBadge.textContent = "A soft rumble echoes across the page.";
  setTimeout(() => {
    body.classList.remove("paw-active");
  }, 2000);
};

const showBearBadge = () => {
  body.classList.add("bear-active");
  actionBadge.textContent = "Bear avatar appears near the console.";
  setTimeout(() => body.classList.remove("bear-active"), 2000);
};

const highlightDadPov = () => {
  body.classList.add("pov-active");
  actionBadge.textContent = "Dad’s POV highlighted.";
  setTimeout(() => body.classList.remove("pov-active"), 2400);
};

const showCollagePreview = () => {
  if (!collage || !chapterData) return;
  collage.hidden = false;
  actionBadge.textContent = "Preview collage revealed.";
  const photos = chapterData.chapters?.photos?.items || [];
  collageGrid.innerHTML = "";
  photos.slice(0, 4).forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "collage-item";
    wrapper.style.setProperty("--tilt", `${index % 2 === 0 ? "-2deg" : "2deg"}`);
    const img = document.createElement("img");
    img.src = item.imagePath;
    img.alt = item.title;
    wrapper.appendChild(img);
    collageGrid.appendChild(wrapper);
  });
};

const openModal = chapterKey => {
  if (!chapterData) return;
  const chapter = chapterData.chapters?.[chapterKey];
  if (!chapter) return;
  activeChapter = chapterKey;
  activeIndex = 0;
  updateModal();
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
};

const updateModal = () => {
  const chapter = chapterData.chapters?.[activeChapter];
  if (!chapter) return;
  const item = chapter.items[activeIndex];
  modalTitle.textContent = `${chapter.title}: ${item.title}`;
  modalBody.innerHTML = `
    <p>${item.memoryText}</p>
    <img src="${item.imagePath}" alt="${item.title}" />
  `;
};

const closeModal = () => {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
};

const attachModalEvents = () => {
  modalClose?.addEventListener("click", closeModal);
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModal();
    }
  });
  modalPrev?.addEventListener("click", () => {
    const items = chapterData.chapters?.[activeChapter]?.items || [];
    activeIndex = (activeIndex - 1 + items.length) % items.length;
    updateModal();
  });
  modalNext?.addEventListener("click", () => {
    const items = chapterData.chapters?.[activeChapter]?.items || [];
    activeIndex = (activeIndex + 1) % items.length;
    updateModal();
  });
};

const loadContent = async () => {
  const dataUrl = pageType === "private" ? "/grace/chapters/data/private_content.json" : "/grace/data/public_content.json";
  try {
    const response = await fetch(dataUrl);
    chapterData = await response.json();
    renderChapters();
  } catch (error) {
    debugLog("content load failed", error);
  }
};

const renderChapters = () => {
  chapterButtons.forEach(button => {
    const chapterKey = button.closest(".quadrant")?.dataset.chapter;
    if (!chapterKey || !chapterData?.chapters?.[chapterKey]) return;
    const chapter = chapterData.chapters[chapterKey];
    button.querySelector(".chapter-title").textContent = chapter.title;
    button.querySelector(".chapter-blurb").textContent = chapter.blurb;
    button.addEventListener("click", () => openModal(chapterKey));
  });
};

if (answerForm) {
  answerForm.addEventListener("submit", event => {
    event.preventDefault();
    if (isUnlocked) return;
    const { correct } = validateInputs();
    if (correct) {
      unlock();
    } else {
      attempts += 1;
      updateFeedback("Not quite. Try again with calm, steady words.");
      updateHint();
    }
  });
}

if (swapButton) {
  swapButton.addEventListener("click", () => {
    const fromIndex = Number(swapFrom.value);
    const toIndex = Number(swapTo.value);
    swapTiles(fromIndex, toIndex);
  });
}

attachModalEvents();
loadContent();

if (startUnlocked) {
  inputs.forEach((input, index) => {
    if (input) {
      input.value = correctWords[index];
    }
  });
  unlock({ skipAnimation: true });
}
