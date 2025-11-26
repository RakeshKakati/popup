const POST_SELECTOR =
  "article.feed-shared-update-v2, div.feed-shared-update-v2, article[data-id^='urn:li:'], div[data-id^='urn:li:activity'], div[data-id^='urn:li:ugcPost']";

const HANDLED_ATTR = "data-linkedin-popout-ready";
const DROPZONE_ID = "linkedin-popout-dropzone";

let dropZoneEl;
let currentDragData = null;

function normaliseText(value) {
  return value ? value.replace(/\s+/g, " ").trim() : "";
}

function init() {
  if (window.hasLinkedInPopoutExtension) return;
  window.hasLinkedInPopoutExtension = true;

  ensureDropZone();
  hydrateExistingPosts();
  observeForNewPosts();
}

function ensureDropZone() {
  if (dropZoneEl) return;

  dropZoneEl = document.createElement("div");
  dropZoneEl.id = DROPZONE_ID;
  dropZoneEl.textContent = "Drop post here to pop it out";

  dropZoneEl.addEventListener("dragover", (event) => {
    if (!currentDragData) return;
    event.preventDefault();
    dropZoneEl.classList.add("active");
  });

  dropZoneEl.addEventListener("dragleave", () => {
    dropZoneEl.classList.remove("active");
  });

  dropZoneEl.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZoneEl.classList.remove("active");
    if (currentDragData) {
      openWindowFromData(currentDragData);
      currentDragData = null;
      toggleDropZone(false);
    }
  });

  document.body.appendChild(dropZoneEl);
  toggleDropZone(false);
}

function toggleDropZone(shouldShow) {
  if (!dropZoneEl) return;
  dropZoneEl.style.display = shouldShow ? "flex" : "none";
}

function hydrateExistingPosts() {
  document.querySelectorAll(POST_SELECTOR).forEach((post) => enhancePost(post));
}

function observeForNewPosts() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches(POST_SELECTOR)) {
          enhancePost(node);
          return;
        }
        node.querySelectorAll?.(POST_SELECTOR).forEach((el) => enhancePost(el));
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function enhancePost(postEl) {
  if (!postEl || postEl.getAttribute(HANDLED_ATTR) === "true") return;

  if (
    postEl.closest(".comments-comment-item, .comments-comments-list, .comments-comment, .comments-comments-list__comment") ||
    postEl.getAttribute("data-test-reply-comment") === "true"
  ) {
    return;
  }

  postEl.setAttribute(HANDLED_ATTR, "true");
  postEl.setAttribute("draggable", "true");

  postEl.addEventListener("dragstart", (event) => handleDragStart(event, postEl));
  postEl.addEventListener("dragend", handleDragEnd);

  injectHandle(postEl);
}

function injectHandle(postEl) {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "linkedin-popout-handle";
  handle.textContent = "Pop out";
  handle.title = "Open this post in its own window";

  handle.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    const data = extractPostData(postEl);
    openWindowFromData(data);
  });

  postEl.prepend(handle);
}

function handleDragStart(event, postEl) {
  const data = extractPostData(postEl);
  currentDragData = data;

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", data.actor || "LinkedIn post");
  }

  toggleDropZone(true);
}

function handleDragEnd() {
  currentDragData = null;
  toggleDropZone(false);
  dropZoneEl?.classList.remove("active");
}

/*  
  FIXED — NO DUPLICATES  
  Uses a single canonical text container.
*/
function extractPostData(postEl) {
  let actorRaw = normaliseText(
    postEl.querySelector(".feed-shared-actor__name, .update-components-actor__title span")?.textContent
  );
  
  // Remove duplicate if name appears twice (e.g., "Abhishek Kumar GuptaAbhishek Kumar Gupta")
  if (actorRaw && actorRaw.length > 6) {
    const mid = Math.floor(actorRaw.length / 2);
    const first = actorRaw.slice(0, mid);
    const second = actorRaw.slice(mid);
    if (first === second) {
      actorRaw = first;
    }
  }
  
  const actor = actorRaw || "LinkedIn member";

  // Canonical text source (no mixing)
  const textEl =
    postEl.querySelector(".update-components-text") ||
    postEl.querySelector(".feed-shared-update-v2__description") ||
    postEl.querySelector(".feed-shared-inline-show-more-text");

  const text = textEl
    ? normaliseText(textEl.innerText || textEl.textContent || "")
    : "";

  const images = Array.from(postEl.querySelectorAll("img"))
    .filter((img) => {
      // Skip reaction icons (like, celebrate, etc.) and small UI icons
      if (!img.src) return false;
      if (img.width < 40 || img.height < 40) return false;
      if (img.alt?.toLowerCase().includes("reaction")) return false;
      if (img.src.includes("reaction") || img.src.includes("emoji")) return false;
      return true;
    })
    .map((img) => img.src)
    .slice(0, 4);

  const timestamp =
    postEl.querySelector("time")?.getAttribute("datetime") ||
    postEl.querySelector("time")?.textContent?.trim() ||
    new Date().toLocaleString();

  let url = "";
  const permalinkEl =
    postEl.querySelector('a[href*="linkedin.com/posts/"]') ||
    postEl.querySelector('a[href*="/feed/update/"]') ||
    postEl.querySelector('a[href*="activity"]');

  if (permalinkEl?.href) {
    url = permalinkEl.href.startsWith("/") ? location.origin + permalinkEl.href : permalinkEl.href;
  }

  if (!url) {
    const urn =
      postEl.getAttribute("data-urn") ||
      postEl.getAttribute("data-id") ||
      postEl.closest("[data-urn]")?.getAttribute("data-urn") ||
      postEl.closest("[data-id]")?.getAttribute("data-id") ||
      "";

    const match = urn.match(/urn:li:(activity|ugcPost):[0-9]+/);
    if (match) {
      url = `https://www.linkedin.com/feed/update/${encodeURIComponent(match[0])}/`;
    }
  }

  return {
    actor,
    text,
    images,
    timestamp,
    capturedAt: new Date().toISOString(),
    url
  };
}

async function openWindowFromData(postData) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "OPEN_POST_WINDOW",
      payload: postData
    });

    if (!response?.success) {
      throw new Error(response?.error || "Unknown error");
    }
  } catch (error) {
    console.error("LinkedIn pop-out failed", error);
  }
}

init();
