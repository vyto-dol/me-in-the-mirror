const accessoryCatalog = [
  {
    id: "visor",
    label: "Hero Visor (Mặt nạ)",
    hint: "Face mask for the hero / Mặt nạ anh hùng",
    icon: "🥽",
    iconClass: "visor",
  },
  {
    id: "crown",
    label: "Power Crown (Vương miện)",
    hint: "Golden crown on top / Vương miện vàng",
    icon: "👑",
    iconClass: "crown",
  },
  {
    id: "comic",
    label: "Comic Burst (Hiệu ứng nổ)",
    hint: "Action burst near the mirror / Hiệu ứng truyện tranh",
    icon: "💥",
    iconClass: "comic",
  },
  {
    id: "lightning",
    label: "Lightning Bolt (Tia sét)",
    hint: "Energy bolt on the outfit / Tia sét năng lượng",
    icon: "⚡",
    iconClass: "lightning",
  },
  {
    id: "belt",
    label: "Victory Belt (Đai chiến thắng)",
    hint: "Champion belt at the waist / Đai ở eo",
    icon: "🥇",
    iconClass: "belt",
  },
  {
    id: "badge",
    label: "Wing Badge (Huy hiệu cánh)",
    hint: "Hero badge on the chest / Huy hiệu trước ngực",
    icon: "🎖",
    iconClass: "badge",
  },
  {
    id: "trail",
    label: "Star Trail (Đuôi sao)",
    hint: "Comet trail by the mirror / Vệt sao cạnh gương",
    icon: "☄️",
    iconClass: "trail",
  },
  {
    id: "bubble",
    label: "Speech Bubble (Khung thoại)",
    hint: "Talking bubble nearby / Bong bóng thoại",
    icon: "💬",
    iconClass: "bubble",
  },
];

const refs = {
  landingScreen: document.getElementById("landingScreen"),
  personalityScreen: document.getElementById("personalityScreen"),
  decorateScreen: document.getElementById("decorateScreen"),
  landingForm: document.getElementById("landingForm"),
  studentName: document.getElementById("studentName"),
  classCode: document.getElementById("classCode"),
  landingError: document.getElementById("landingError"),
  proudInput: document.getElementById("proudInput"),
  mythInput: document.getElementById("mythInput"),
  weaknessInput: document.getElementById("weaknessInput"),
  betterInput: document.getElementById("betterInput"),
  personalityBackButton: document.getElementById("personalityBackButton"),
  toDecorateButton: document.getElementById("toDecorateButton"),
  decorateBackButton: document.getElementById("decorateBackButton"),
  generateButton: document.getElementById("generateButton"),
  downloadPosterButton: document.getElementById("downloadPosterButton"),
  downloadPanel: document.getElementById("downloadPanel"),
  generatedImage: document.getElementById("generatedImage"),
  posterFrame: document.getElementById("posterFrame"),
  emptyState: document.getElementById("emptyState"),
  loadingState: document.getElementById("loadingState"),
  generationError: document.getElementById("generationError"),
  generationStatus: document.getElementById("generationStatus"),
  summaryRows: Array.from(document.querySelectorAll("[data-student-summary]")),
  summaryProud: Array.from(document.querySelectorAll("[data-summary-proud]")),
  summaryMyth: Array.from(document.querySelectorAll("[data-summary-myth]")),
  summaryUpgrade: Array.from(document.querySelectorAll("[data-summary-upgrade]")),
  summaryAccessories: Array.from(
    document.querySelectorAll("[data-summary-accessories]"),
  ),
  accessoryGrid: document.getElementById("accessoryGrid"),
  accessoryCounts: Array.from(document.querySelectorAll("[data-accessory-count]")),
  accessoryInputs: [],
};

const state = {
  screen: "landing",
  student: {
    name: "",
    classCode: "",
    gender: "boy",
  },
  proud: "",
  myth: "",
  weakness: "",
  better: "",
  accessories: new Set(),
  generatedImageDataUrl: "",
  generatedMimeType: "image/png",
  loading: false,
  error: "",
};

init();

function init() {
  renderAccessoryOptions();

  refs.landingForm.addEventListener("submit", handleLandingSubmit);
  refs.proudInput.addEventListener("input", handleFieldInput);
  refs.mythInput.addEventListener("input", handleFieldInput);
  refs.weaknessInput.addEventListener("input", handleFieldInput);
  refs.betterInput.addEventListener("input", handleFieldInput);
  refs.personalityBackButton.addEventListener("click", () => showScreen("landing"));
  refs.toDecorateButton.addEventListener("click", () => showScreen("decorate"));
  refs.decorateBackButton.addEventListener("click", () => showScreen("personality"));
  refs.generateButton.addEventListener("click", generateImage);
  refs.downloadPosterButton.addEventListener("click", downloadGeneratedImage);

  render();
}

function renderAccessoryOptions() {
  refs.accessoryGrid.innerHTML = accessoryCatalog
    .map(
      (item) => `
        <label class="accessory-option">
          <input type="checkbox" data-accessory="${escapeHtml(item.id)}" />
          <span class="accessory-card">
            <span class="accessory-icon-shell">
              <span class="accessory-icon accessory-icon-${escapeHtml(item.iconClass)}" aria-hidden="true">
                ${escapeHtml(item.icon)}
              </span>
            </span>
            <span class="accessory-meta">
              <strong>${escapeHtml(item.label)}</strong>
              <small>${escapeHtml(item.hint)}</small>
            </span>
          </span>
        </label>
      `,
    )
    .join("");

  refs.accessoryInputs = Array.from(refs.accessoryGrid.querySelectorAll("[data-accessory]"));
  refs.accessoryInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.accessories.add(input.dataset.accessory);
      } else {
        state.accessories.delete(input.dataset.accessory);
      }
      invalidateGeneratedImage();
      render();
    });
  });
}

function handleLandingSubmit(event) {
  event.preventDefault();

  const name = refs.studentName.value.trim();
  const classCode = refs.classCode.value.trim();
  const gender =
    refs.landingForm.querySelector('input[name="gender"]:checked')?.value || "boy";

  if (!name || !classCode) {
    refs.landingError.hidden = false;
    return;
  }

  refs.landingError.hidden = true;
  state.student.name = name.slice(0, 28);
  state.student.classCode = classCode.slice(0, 18).toUpperCase();
  state.student.gender = gender;
  showScreen("personality");
  render();
}

function handleFieldInput() {
  state.proud = refs.proudInput.value.trim();
  state.myth = refs.mythInput.value.trim();
  state.weakness = refs.weaknessInput.value.trim();
  state.better = refs.betterInput.value.trim();
  invalidateGeneratedImage();
  render();
}

function showScreen(screen) {
  state.screen = screen;
  refs.landingScreen.classList.toggle("hidden", screen !== "landing");
  refs.personalityScreen.classList.toggle("hidden", screen !== "personality");
  refs.decorateScreen.classList.toggle("hidden", screen !== "decorate");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  const summaryMarkup = buildStudentSummary();
  refs.summaryRows.forEach((row) => {
    row.innerHTML = summaryMarkup;
  });

  const accessories = getSelectedAccessories();
  const hasImage = Boolean(state.generatedImageDataUrl);
  const readyForDecorate = hasPersonalityFields();
  const readyToGenerate = isReadyForGeneration();
  const accessoryLabel = accessories.length
    ? accessories.map((item) => item.label).join(", ")
    : "base hero only";

  refs.summaryProud.forEach((node) => {
    node.textContent = state.proud || "not set yet";
  });
  refs.summaryMyth.forEach((node) => {
    node.textContent = state.myth || "not set yet";
  });
  refs.summaryUpgrade.forEach((node) => {
    node.textContent = readyForDecorate
      ? `${state.weakness} => ${state.better}`
      : "not set yet";
  });
  refs.summaryAccessories.forEach((node) => {
    node.textContent = accessoryLabel;
  });
  refs.accessoryCounts.forEach((node) => {
    node.textContent = `${accessories.length} accessories`;
  });

  refs.toDecorateButton.disabled = !readyForDecorate;
  refs.generateButton.disabled = state.loading || !readyToGenerate;
  refs.generateButton.textContent = state.loading ? "Generating..." : "Generate Image";
  refs.generationStatus.textContent = state.loading
    ? "Generating"
    : hasImage
      ? "Done"
      : readyToGenerate
        ? "Ready"
        : "Waiting";

  refs.generationError.textContent = state.error;
  refs.generationError.classList.toggle("hidden", !state.error);
  refs.emptyState.classList.toggle("hidden", state.loading || hasImage);
  refs.loadingState.classList.toggle("hidden", !state.loading);
  refs.posterFrame.classList.toggle("hidden", !hasImage);
  refs.downloadPanel.classList.toggle("hidden", !hasImage);

  if (hasImage) {
    refs.generatedImage.src = state.generatedImageDataUrl;
  } else {
    refs.generatedImage.removeAttribute("src");
  }

  refs.accessoryInputs.forEach((input) => {
    input.checked = state.accessories.has(input.dataset.accessory);
  });
}

function buildStudentSummary() {
  if (!state.student.name || !state.student.classCode) {
    return "";
  }

  const genderLabel = state.student.gender === "girl" ? "Girl Hero" : "Boy Hero";

  return [
    { label: "Student", value: state.student.name },
    { label: "Class", value: state.student.classCode },
    { label: "Hero", value: genderLabel },
  ]
    .map(
      (item) => `
        <span class="summary-chip">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.value)}</span>
        </span>
      `,
    )
    .join("");
}

function getSelectedAccessories() {
  return accessoryCatalog.filter((item) => state.accessories.has(item.id));
}

function hasPersonalityFields() {
  return Boolean(state.proud && state.myth && state.weakness && state.better);
}

function isReadyForGeneration() {
  return Boolean(
    state.student.name &&
      state.student.classCode &&
      ["boy", "girl"].includes(state.student.gender) &&
      hasPersonalityFields(),
  );
}

function invalidateGeneratedImage() {
  state.generatedImageDataUrl = "";
  state.generatedMimeType = "image/png";
  state.error = "";
}

async function generateImage() {
  if (state.loading) {
    return;
  }

  if (!isReadyForGeneration()) {
    state.error =
      "Điền đủ The Proud, The Myth, The weakness và The change trước khi generate nhé.";
    render();
    return;
  }

  const payload = {
    student: state.student,
    proud: state.proud,
    myth: state.myth,
    weakness: state.weakness,
    better: state.better,
    accessories: getSelectedAccessories().map((item) => item.id),
  };

  state.loading = true;
  state.error = "";
  state.generatedImageDataUrl = "";
  render();

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Image generation failed.");
    }

    if (!data.imageBase64) {
      throw new Error("Gemini returned no image data.");
    }

    state.generatedMimeType = data.mimeType || "image/png";
    state.generatedImageDataUrl = `data:${state.generatedMimeType};base64,${data.imageBase64}`;
  } catch (error) {
    state.error = error instanceof Error ? error.message : "Image generation failed.";
  } finally {
    state.loading = false;
    render();
  }
}

function downloadGeneratedImage() {
  if (!state.generatedImageDataUrl) {
    return;
  }

  const link = document.createElement("a");
  link.href = state.generatedImageDataUrl;
  link.download = buildDownloadName();
  document.body.append(link);
  link.click();
  link.remove();
}

function buildDownloadName() {
  const safeName = `${state.student.name || "student"}-${state.student.classCode || "class"}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const extension =
    state.generatedMimeType === "image/jpeg"
      ? "jpg"
      : state.generatedMimeType === "image/webp"
        ? "webp"
        : "png";

  return `me-in-the-mirror-${safeName || "poster"}.${extension}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
