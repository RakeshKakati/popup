const searchInput = document.getElementById("search-input");
const tagFilter = document.getElementById("tag-filter");
const authorFilter = document.getElementById("author-filter");
const dateFromInput = document.getElementById("date-from");
const libraryEl = document.getElementById("library");
const statusEl = document.getElementById("sp-status");
const exportBtn = document.getElementById("export-btn");

let posts = [];

searchInput?.addEventListener("input", render);
tagFilter?.addEventListener("change", render);
authorFilter?.addEventListener("change", render);
dateFromInput?.addEventListener("change", render);
exportBtn?.addEventListener("click", exportCurrentView);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.savedPosts) {
    posts = Array.isArray(changes.savedPosts.newValue) ? changes.savedPosts.newValue : [];
    buildFilters();
    render();
  }
});

function loadPosts() {
  status("Loading…");
  chrome.storage.local.get(["savedPosts"], (result) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      status("Failed to load saved posts.", "error");
      return;
    }
    posts = Array.isArray(result.savedPosts) ? result.savedPosts : [];
    buildFilters();
    render();
  });
}

function buildFilters() {
  const allTags = new Set();
  const allAuthors = new Set();

  posts.forEach((p) => {
    (p.tags || []).forEach((t) => allTags.add(t));
    if (p.actor) {
      allAuthors.add(p.actor);
    }
  });

  populateSelect(tagFilter, Array.from(allTags).sort(), "All tags");
  populateSelect(authorFilter, Array.from(allAuthors).sort(), "All authors");
}

function populateSelect(select, values, placeholder) {
  if (!select) return;

  const current = select.value;
  select.innerHTML = "";

  const opt = document.createElement("option");
  opt.value = "";
  opt.textContent = placeholder;
  select.appendChild(opt);

  values.forEach((v) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    select.appendChild(o);
  });

  if (current && values.includes(current)) {
    select.value = current;
  }
}

function getFilteredPosts() {
  const query = (searchInput?.value || "").toLowerCase();
  const tag = tagFilter?.value || "";
  const author = authorFilter?.value || "";
  const dateFrom = dateFromInput?.value ? new Date(dateFromInput.value) : null;

  const filtered = posts.filter((p) => {
    if (query) {
      const haystack = `${p.actor || ""}\n${p.headline || ""}\n${p.text || ""}\n${(p.tags || []).join(" ")}\n${p.note || ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (tag && !(p.tags || []).includes(tag)) return false;
    if (author && p.actor !== author) return false;

    if (dateFrom) {
      const savedDate = p.savedAt ? new Date(p.savedAt) : null;
      if (!savedDate || savedDate < dateFrom) return false;
    }
    return true;
  });

  return filtered;
}

function render() {
  libraryEl.innerHTML = "";

  const filtered = getFilteredPosts();

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "sp-empty";
    empty.textContent = posts.length === 0 ? "Nothing saved yet. Save a post from the pop-out window to see it here." : "No posts match your filters.";
    libraryEl.appendChild(empty);
    status(`0 posts`);
    return;
  }

  filtered
    .slice()
    .sort((a, b) => new Date(b.savedAt || b.capturedAt || 0) - new Date(a.savedAt || a.capturedAt || 0))
    .forEach((p) => {
      const card = document.createElement("article");
      card.className = "sp-card";

      const header = document.createElement("div");
      header.className = "sp-card-header";

      const actor = document.createElement("div");
      actor.className = "sp-card-actor";
      actor.textContent = p.actor || "LinkedIn member";

      const date = document.createElement("div");
      date.className = "sp-card-date";
      const d = p.savedAt || p.capturedAt || p.timestamp;
      date.textContent = d ? new Date(d).toLocaleDateString() : "";

      header.appendChild(actor);
      header.appendChild(date);
      card.appendChild(header);

      const text = document.createElement("p");
      text.className = "sp-card-text";
      const body = p.headline || p.text || "";
      text.textContent = body.length > 220 ? `${body.slice(0, 220)}…` : body || "No text.";
      card.appendChild(text);

      if (Array.isArray(p.tags) && p.tags.length > 0) {
        const tagsRow = document.createElement("div");
        tagsRow.className = "sp-card-tags";
        p.tags.forEach((t) => {
          const chip = document.createElement("span");
          chip.className = "sp-tag";
          chip.textContent = t;
          tagsRow.appendChild(chip);
        });
        card.appendChild(tagsRow);
      }

      if (p.note) {
        const note = document.createElement("p");
        note.className = "sp-card-note";
        note.textContent = p.note;
        card.appendChild(note);
      }

      if (p.url) {
        card.classList.add("sp-card--clickable");
        card.addEventListener("click", () => {
          chrome.tabs.create({ url: p.url });
        });

        const openLink = document.createElement("button");
        openLink.type = "button";
        openLink.className = "sp-open-link";
        openLink.textContent = "Open on LinkedIn";
        openLink.addEventListener("click", (event) => {
          event.stopPropagation();
          chrome.tabs.create({ url: p.url });
        });
        card.appendChild(openLink);
      }

      libraryEl.appendChild(card);
    });

  status(`${filtered.length} post${filtered.length === 1 ? "" : "s"}`);
}

function status(text, tone = "info") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.dataset.tone = tone;
}

function csvEscape(value) {
  const v = (value ?? "").toString().replace(/\r?\n/g, " ");
  if (/[",]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function exportCurrentView() {
  const rows = getFilteredPosts();

  if (!rows.length) {
    status("Nothing to export.", "info");
    return;
  }

  const header = ["Actor", "Headline/Text", "Tags", "Note", "Saved at", "Original URL"];
  const dataRows = rows.map((p) => [
    p.actor || "LinkedIn member",
    p.headline || p.text || "",
    (p.tags || []).join(" | "),
    p.note || "",
    p.savedAt || p.capturedAt || p.timestamp || "",
    p.url || ""
  ]);

  const csvLines = [header, ...dataRows].map((cols) => cols.map(csvEscape).join(","));
  const csvContent = "\ufeff" + csvLines.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "linkedin-posts.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);

  status(`Exported ${rows.length} post${rows.length === 1 ? "" : "s"} to CSV.`, "info");
}

loadPosts();


