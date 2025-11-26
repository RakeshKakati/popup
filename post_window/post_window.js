const postContainer = document.getElementById("post");
const statusEl = document.getElementById("status");
const timestampEl = document.getElementById("timestamp");
const refreshBtn = document.getElementById("refresh-btn");
const savePostBtn = document.getElementById("save-post-btn");
const tagsInput = document.getElementById("tags-input");
const notesInput = document.getElementById("notes-input");
const openLibraryBtn = document.getElementById("open-library-btn");

let latestPostData = null;
let latestPostId = null;

function dedupeSentences(text) {
  if (!text) return "";

  const normalised = text.replace(/\s+/g, " ").trim();
  if (!normalised) return "";

  const parts = normalised.split(/(?<=[.!?])\s+/);
  const seen = new Set();
  const result = [];

  for (const part of parts) {
    const key = part.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(part.trim());
  }

  return result.join(" ");
}

refreshBtn?.addEventListener("click", hydrate);
window.addEventListener("hashchange", hydrate);

savePostBtn?.addEventListener("click", async () => {
  if (!latestPostData) {
    renderStatus("No post loaded to save.", "warn");
    return;
  }

  // Check usage limit
  const { isPro, savedPosts } = await chrome.storage.local.get(["isPro", "savedPosts"]);
  const currentCount = savedPosts?.length || 0;
  
  if (!isPro && currentCount >= 100) {
    renderStatus("Free limit reached (100 posts). Upgrade to Pro for unlimited saves.", "warn");
    // Open upgrade page
    setTimeout(() => {
      chrome.tabs.create({ url: chrome.runtime.getURL("payment/checkout.html") });
    }, 1000);
    return;
  }

  const tags = (tagsInput.value || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const note = (notesInput.value || "").trim();

  try {
    await savePostToLibrary({
      ...latestPostData,
      id: latestPostId || crypto.randomUUID(),
      tags,
      note,
      savedAt: new Date().toISOString()
    });

    const newCount = currentCount + 1;
    const remaining = isPro ? "∞" : Math.max(0, 100 - newCount);
    renderStatus(`Saved to library. (${remaining} saves remaining)`, "info");
  } catch (error) {
    console.error("Failed to save post", error);
    renderStatus("Failed to save post. See console for details.", "error");
  }
});

openLibraryBtn?.addEventListener("click", async () => {
  try {
    const url = chrome.runtime.getURL("sidepanel/sidepanel.html");
    // Always open the library in its own tab/window so it works
    // even if the sidePanel API is unavailable.
    chrome.tabs.create({ url });
  } catch (error) {
    console.error("Failed to open library", error);
  }
});

async function hydrate() {
  const postId = window.location.hash.replace("#", "");

  if (!postId) {
    renderStatus("No post attached. Drag a post again to refresh.", "warn");
    postContainer.innerHTML = "";
    timestampEl.textContent = "";
    return;
  }

  renderStatus("Loading post...");
  const response = await requestPostData(postId);

  if (!response?.success || !response.data) {
    postContainer.innerHTML = "";
    timestampEl.textContent = "";
    renderStatus("Post data expired. Drag it again to open a fresh window.", "error");
    return;
  }

  latestPostData = response.data;
  latestPostId = postId;
  renderPost(response.data);
  renderStatus("Ready");
}

function renderPost(data) {
  postContainer.innerHTML = "";
  timestampEl.textContent = data.timestamp ? `Posted ${data.timestamp}` : "";

  const actorEl = document.createElement("h1");
  actorEl.className = "actor";
  actorEl.textContent = data.actor || "LinkedIn member";

  const textEl = document.createElement("div");
  textEl.className = "body";

  const cleanText = dedupeSentences(data.text || "");
  const paragraphs = cleanText.split(/\n{2,}/g).filter(Boolean);
  if (paragraphs.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No text was detected for this post.";
    textEl.appendChild(empty);
  } else {
    paragraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      textEl.appendChild(p);
    });
  }

  const mediaWrapper = document.createElement("div");
  mediaWrapper.className = "media";

  (data.images || []).forEach((src, index) => {
    const container = document.createElement("div");
    container.className = "media-item";
    
    const img = document.createElement("img");
    img.src = src;
    img.alt = `LinkedIn post media ${index + 1}`;
    container.appendChild(img);
    
    const downloadBtn = document.createElement("a");
    downloadBtn.href = src;
    downloadBtn.download = `linkedin-image-${index + 1}.jpg`;
    downloadBtn.className = "media-download";
    downloadBtn.textContent = "Download";
    downloadBtn.target = "_blank";
    container.appendChild(downloadBtn);
    
    mediaWrapper.appendChild(container);
  });

  postContainer.appendChild(actorEl);

  if (data.headline) {
    const headlineEl = document.createElement("h2");
    headlineEl.className = "headline";
    headlineEl.textContent = data.headline;
    postContainer.appendChild(headlineEl);
  }

  postContainer.appendChild(textEl);

  if (mediaWrapper.childElementCount > 0) {
    postContainer.appendChild(mediaWrapper);
  }

  const capturedAt = document.createElement("p");
  capturedAt.className = "captured-at";
  capturedAt.textContent = data.capturedAt ? `Captured ${new Date(data.capturedAt).toLocaleString()}` : "";
  postContainer.appendChild(capturedAt);
}

function renderStatus(text, tone = "info") {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = text;
  statusEl.dataset.tone = tone;
}

function requestPostData(postId) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: "GET_POST_DATA",
        postId
      },
      (response) => resolve(response)
    );
  });
}

function savePostToLibrary(post) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["savedPosts"], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const existing = Array.isArray(result.savedPosts) ? result.savedPosts : [];
      const withoutSameId = existing.filter((p) => p.id !== post.id);
      const updated = [...withoutSameId, post];

      chrome.storage.local.set({ savedPosts: updated }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

hydrate();

