const accessoryCatalog = [
  { id: "visor", label: "Hero visor" },
  { id: "crown", label: "Power crown" },
  { id: "comic", label: "Comic burst" },
  { id: "lightning", label: "Lightning bolt" },
  { id: "belt", label: "Victory belt" },
  { id: "badge", label: "Wing badge" },
  { id: "trail", label: "Star trail" },
  { id: "bubble", label: "Speech bubble" },
];

const placeholderCopy = {
  proud: "organized",
  myth: "misunderstood",
  weakness: "quiet",
  better: "confident",
};

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
  randomizeButton: document.getElementById("randomizeButton"),
  downloadSvgButton: document.getElementById("downloadSvgButton"),
  downloadPngButton: document.getElementById("downloadPngButton"),
  startOverButton: document.getElementById("startOverButton"),
  studentSummaryRows: Array.from(document.querySelectorAll("[data-student-summary]")),
  scenePreviews: Array.from(document.querySelectorAll("[data-scene-preview]")),
  accessoryCounts: Array.from(document.querySelectorAll("[data-accessory-count]")),
  accessoryInputs: Array.from(document.querySelectorAll("[data-accessory]")),
};

const state = {
  currentScreen: "landing",
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
};

init();

function init() {
  refs.landingForm.addEventListener("submit", handleLandingSubmit);
  refs.proudInput.addEventListener("input", handleFieldInput);
  refs.mythInput.addEventListener("input", handleFieldInput);
  refs.weaknessInput.addEventListener("input", handleFieldInput);
  refs.betterInput.addEventListener("input", handleFieldInput);
  refs.personalityBackButton.addEventListener("click", () => showScreen("landing"));
  refs.toDecorateButton.addEventListener("click", () => showScreen("decorate"));
  refs.decorateBackButton.addEventListener("click", () => showScreen("personality"));
  refs.randomizeButton.addEventListener("click", randomizeAccessories);
  refs.downloadSvgButton.addEventListener("click", () => downloadScene("svg"));
  refs.downloadPngButton.addEventListener("click", () => downloadScene("png"));
  refs.startOverButton.addEventListener("click", resetApplication);

  refs.accessoryInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.accessories.add(input.dataset.accessory);
      } else {
        state.accessories.delete(input.dataset.accessory);
      }
      renderApp();
    });
  });

  renderApp();
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
  renderApp();
}

function handleFieldInput() {
  state.proud = refs.proudInput.value;
  state.myth = refs.mythInput.value;
  state.weakness = refs.weaknessInput.value;
  state.better = refs.betterInput.value;
  renderApp();
}

function showScreen(screen) {
  state.currentScreen = screen;
  refs.landingScreen.classList.toggle("hidden", screen !== "landing");
  refs.personalityScreen.classList.toggle("hidden", screen !== "personality");
  refs.decorateScreen.classList.toggle("hidden", screen !== "decorate");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetApplication() {
  state.currentScreen = "landing";
  state.student = {
    name: "",
    classCode: "",
    gender: "boy",
  };
  state.proud = "";
  state.myth = "";
  state.weakness = "";
  state.better = "";
  state.accessories = new Set();

  refs.landingForm.reset();
  refs.proudInput.value = "";
  refs.mythInput.value = "";
  refs.weaknessInput.value = "";
  refs.betterInput.value = "";
  refs.accessoryInputs.forEach((input) => {
    input.checked = false;
  });
  refs.landingError.hidden = true;
  renderApp();
  showScreen("landing");
}

function renderApp() {
  const summaryMarkup = buildStudentSummary();
  refs.studentSummaryRows.forEach((row) => {
    row.innerHTML = summaryMarkup;
  });

  refs.accessoryCounts.forEach((badge) => {
    badge.textContent = `${state.accessories.size} accessories`;
  });

  const sceneMarkup = buildSceneSvg();
  refs.scenePreviews.forEach((preview) => {
    preview.innerHTML = sceneMarkup;
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

function buildSceneSvg() {
  const proud = getDisplayText("proud");
  const myth = getDisplayText("myth");
  const weakness = getDisplayText("weakness");
  const better = getDisplayText("better");

  const proudLayout = fitTextLayout(proud.value, {
    maxChars: 12,
    maxLines: 2,
    baseSize: 29,
    minSize: 18,
  });
  const mythLayout = fitTextLayout(myth.value, {
    maxChars: 11,
    maxLines: 2,
    baseSize: 36,
    minSize: 20,
  });
  const weaknessLayout = fitTextLayout(weakness.value, {
    maxChars: 10,
    maxLines: 2,
    baseSize: 24,
    minSize: 16,
  });
  const betterLayout = fitTextLayout(better.value, {
    maxChars: 10,
    maxLines: 2,
    baseSize: 28,
    minSize: 18,
  });
  const studentLabel = `${state.student.name || "Student"} • ${state.student.classCode || "Class"}`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 820" role="img" aria-label="Me In The Mirror poster for ${escapeHtml(state.student.name || "student")}">
      <defs>
        <linearGradient id="posterBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#fff8f6" />
        </linearGradient>
        <linearGradient id="accentRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#D42525" />
          <stop offset="100%" stop-color="#FF7C62" />
        </linearGradient>
        <linearGradient id="accentBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0C82CB" />
          <stop offset="100%" stop-color="#1AC2F5" />
        </linearGradient>
        <linearGradient id="mirrorFrame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffd97c" />
          <stop offset="100%" stop-color="#ffa13b" />
        </linearGradient>
        <linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f9fcff" />
          <stop offset="55%" stop-color="#eef2ff" />
          <stop offset="100%" stop-color="#def6ff" />
        </linearGradient>
        <linearGradient id="studentSkin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3159D2" />
          <stop offset="100%" stop-color="#17398F" />
        </linearGradient>
        <linearGradient id="studentShirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2A62FF" />
          <stop offset="100%" stop-color="#2D2BB2" />
        </linearGradient>
        <linearGradient id="capeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fffafc" />
          <stop offset="100%" stop-color="#ffe3ec" />
        </linearGradient>
        <linearGradient id="visorGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffe67a" />
          <stop offset="100%" stop-color="#ffb41d" />
        </linearGradient>
        <linearGradient id="beltGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffefad" />
          <stop offset="100%" stop-color="#d69417" />
        </linearGradient>
        <linearGradient id="bubbleBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7ea9ff" />
          <stop offset="100%" stop-color="#4d7ef1" />
        </linearGradient>
        <linearGradient id="starTail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#b3f5ff" />
          <stop offset="100%" stop-color="#5a7ce6" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.12" />
        </filter>
        <clipPath id="mirrorClip">
          <path d="M430 694 V180 C430 122 472 90 538 90 H590 C656 90 700 122 700 180 V694 Z" />
        </clipPath>
      </defs>

      <rect width="1280" height="820" fill="#F8FAFC" />
      <rect x="20" y="20" width="1240" height="780" rx="38" fill="url(#posterBase)" stroke="#E2E8F0" stroke-width="2" />

      <circle cx="170" cy="158" r="120" fill="#D42525" opacity="0.06" />
      <circle cx="1110" cy="134" r="108" fill="#0C82CB" opacity="0.08" />
      <circle cx="1040" cy="730" r="140" fill="#1AC2F5" opacity="0.05" />

      <g transform="translate(56 56)">
        <rect x="0" y="0" width="288" height="54" rx="27" fill="rgba(255,255,255,0.88)" stroke="#E2E8F0" />
        <text x="24" y="35" fill="#0F172A" font-size="22" font-weight="800" font-family="Inter, sans-serif">${escapeHtml(
          studentLabel,
        )}</text>
      </g>

      <g transform="translate(950 62)">
        <text x="0" y="74" fill="#0F172A" font-size="64" font-weight="900" font-family="Inter, sans-serif">Me In</text>
        <text x="0" y="136" fill="#D42525" font-size="72" font-weight="900" font-family="Inter, sans-serif" letter-spacing="-2">The Mirror</text>
      </g>

      <g transform="translate(60 118)">
        <rect x="0" y="0" width="848" height="648" rx="34" fill="rgba(255,255,255,0.74)" stroke="rgba(226,232,240,0.9)" />
        <rect x="32" y="36" width="228" height="596" rx="30" fill="url(#accentBlue)" opacity="0.22" />
        <g opacity="0.62">
          <path d="M102 94 l28 -28" stroke="#7C74FF" stroke-width="6" stroke-linecap="round" />
          <path d="M96 84 c18 -13 35 5 26 18 c-8 11 -28 0 -26 -18 z" fill="none" stroke="#7C74FF" stroke-width="4" />
          <path d="M124 166 l58 34" stroke="#C7E7FF" stroke-width="12" stroke-linecap="round" />
          <circle cx="188" cy="204" r="20" fill="none" stroke="#C7E7FF" stroke-width="10" />
          <path d="M88 246 l26 -24" stroke="#5C56EC" stroke-width="6" stroke-linecap="round" />
          <path d="M84 238 c18 -13 35 5 26 18 c-8 11 -28 0 -26 -18 z" fill="none" stroke="#5C56EC" stroke-width="4" />
          <path d="M80 514 l44 24" stroke="#6053DA" stroke-width="12" stroke-linecap="round" />
          <path d="M138 558 l30 -30" stroke="#7B6AF4" stroke-width="10" stroke-linecap="round" />
        </g>

        <path d="M408 706 V176 C408 104 464 58 542 58 H592 C670 58 726 104 726 176 V706 Z" fill="url(#mirrorFrame)" filter="url(#softShadow)" />
        <path d="M430 694 V180 C430 122 472 90 538 90 H590 C656 90 700 122 700 180 V694 Z" fill="url(#mirrorGlass)" />
        <g opacity="0.5">
          <path d="M480 92 L560 696" stroke="#ffffff" stroke-width="22" />
          <path d="M575 98 L664 698" stroke="#ffffff" stroke-width="14" />
        </g>

        <g clip-path="url(#mirrorClip)">
          <rect x="430" y="90" width="270" height="604" fill="rgba(255,255,255,0.08)" />
          <circle cx="690" cy="126" r="170" fill="rgba(255,255,255,0.18)" />
          <path d="M698 316 c42 16 74 44 102 90" fill="none" stroke="#D42525" stroke-width="4" opacity="0.9" />
          <path d="M684 344 c58 18 104 52 138 116" fill="none" stroke="#D42525" stroke-width="4" opacity="0.9" />
          ${renderTextBlock({
            lines: mythLayout.lines,
            x: 646,
            y: 162,
            color: "#111827",
            size: mythLayout.size,
            family: "'Snell Roundhand', 'Brush Script MT', cursive",
            anchor: "start",
            opacity: myth.placeholder ? 0.45 : 1,
          })}
          ${renderHero({
            gender: state.student.gender,
            proudLayout,
            weaknessLayout,
            betterLayout,
            proudPlaceholder: proud.placeholder,
            weaknessPlaceholder: weakness.placeholder,
            betterPlaceholder: better.placeholder,
          })}
          ${renderSceneAccessories()}
        </g>

        ${renderStudentBlob()}
      </g>

      ${renderDolMark(60, 724, 1.22)}
    </svg>
  `;
}

function renderHero({
  gender,
  proudLayout,
  weaknessLayout,
  betterLayout,
  proudPlaceholder,
  weaknessPlaceholder,
  betterPlaceholder,
}) {
  const hair = gender === "girl" ? renderGirlHair() : renderBoyHair();

  return `
    <g transform="translate(0 10)">
      <path d="M527 448 C558 427 638 427 669 448 L731 703 C662 734 536 736 464 703 Z" fill="url(#capeGradient)" stroke="#D42525" stroke-width="4" />
      <path d="M532 448 C564 434 631 434 661 448" fill="none" stroke="#D42525" stroke-width="4" />
      <path d="M529 462 c26 -18 52 -26 72 -24 c22 0 44 8 76 24" fill="none" stroke="#D42525" stroke-width="4" />

      ${hair.back}
      <ellipse cx="597" cy="350" rx="94" ry="112" fill="#FFFDFB" stroke="#111827" stroke-width="4" />
      <path d="M535 449 Q597 432 659 449 L641 708 Q597 729 553 708 Z" fill="#FFFDFB" stroke="#111827" stroke-width="4" />
      <path d="M532 489 C480 537 471 607 487 655 L525 640 C512 592 519 548 555 508 Z" fill="#FFFDFB" stroke="#111827" stroke-width="4" />
      <path d="M662 489 C714 537 723 607 707 655 L669 640 C682 592 675 548 639 508 Z" fill="#FFFDFB" stroke="#111827" stroke-width="4" />
      <path d="M546 690 C568 706 624 708 648 690" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round" />
      <path d="M531 651 c-15 15 -34 24 -52 28" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round" />
      <path d="M663 651 c15 15 34 24 52 28" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="565" cy="351" rx="14" ry="26" fill="#1B1120" />
      <ellipse cx="623" cy="351" rx="14" ry="26" fill="#1B1120" />
      <path d="M560 412 C581 428 615 428 636 412" fill="none" stroke="#1B1120" stroke-width="4" stroke-linecap="round" />
      <path d="M529 452 l25 -20 l42 18" fill="none" stroke="#D42525" stroke-width="4" stroke-linecap="round" />
      <path d="M666 452 l-25 -20 l-42 18" fill="none" stroke="#D42525" stroke-width="4" stroke-linecap="round" />
      <path d="M572 432 c10 22 40 22 50 0" fill="none" stroke="#D42525" stroke-width="4" stroke-linecap="round" />
      <rect x="585" y="429" width="24" height="20" rx="8" fill="#FFFDFB" stroke="#D42525" stroke-width="4" />
      ${hair.front}

      ${renderTextBlock({
        lines: proudLayout.lines,
        x: 597,
        y: 548,
        color: "#0C82CB",
        size: proudLayout.size,
        family: "'Snell Roundhand', 'Brush Script MT', cursive",
        anchor: "middle",
        opacity: proudPlaceholder ? 0.46 : 1,
      })}

      ${renderTextBlock({
        lines: weaknessLayout.lines,
        x: 644,
        y: 646,
        color: "#D42525",
        size: weaknessLayout.size,
        family: "'Snell Roundhand', 'Brush Script MT', cursive",
        anchor: "middle",
        rotate: -8,
        opacity: weaknessPlaceholder ? 0.46 : 1,
      })}
      <text x="644" y="688" fill="#111827" font-size="28" font-family="Inter, sans-serif" font-weight="800">→</text>
      ${renderTextBlock({
        lines: betterLayout.lines,
        x: 676,
        y: 690,
        color: "#0C82CB",
        size: betterLayout.size,
        family: "'Snell Roundhand', 'Brush Script MT', cursive",
        anchor: "start",
        rotate: -6,
        opacity: betterPlaceholder ? 0.46 : 1,
      })}
    </g>
  `;
}

function renderBoyHair() {
  return {
    back: `
      <path d="M504 310 C512 254 563 226 629 236 C684 245 709 287 698 350 C678 322 639 301 597 301 C556 301 526 314 504 347 Z" fill="#181A22" />
    `,
    front: `
      <path d="M519 295 C535 248 591 226 650 240 C687 249 703 278 701 309 C667 294 631 287 596 286 C564 286 538 288 519 295 Z" fill="#181A22" />
      <path d="M532 284 C554 262 582 254 612 257" fill="none" stroke="#8A5531" stroke-width="3" stroke-linecap="round" />
      <path d="M591 253 C615 246 641 247 665 260" fill="none" stroke="#8A5531" stroke-width="3" stroke-linecap="round" />
    `,
  };
}

function renderGirlHair() {
  return {
    back: `
      <path d="M667 275 C727 278 760 332 740 424 C727 488 730 586 704 629 C686 661 658 678 629 673 C653 625 663 561 662 504 C660 405 632 315 572 258 C597 241 635 239 667 275 Z" fill="#F0A13C" />
      <path d="M542 263 C578 228 643 228 678 264 C656 253 629 247 603 247 C578 247 556 251 542 263 Z" fill="#F3B44D" />
    `,
    front: `
      <path d="M529 304 C535 248 586 228 641 240 C669 247 693 264 702 312 C685 290 658 277 629 273 C598 268 563 276 529 304 Z" fill="#F3B44D" />
      <path d="M532 286 C553 266 582 257 610 260" fill="none" stroke="#FFCF82" stroke-width="3" stroke-linecap="round" />
      <path d="M583 253 C611 246 640 251 665 267" fill="none" stroke="#FFCF82" stroke-width="3" stroke-linecap="round" />
    `,
  };
}

function renderSceneAccessories() {
  const parts = [];

  if (state.accessories.has("comic")) {
    parts.push(`
      <g transform="translate(480 136)">
        <path d="M0 22 L22 40 L16 12 L46 0 L23 -16 L30 -44 L0 -22 L-22 -44 L-15 -16 L-46 0 L-18 12 L-24 42 Z" fill="#FF6A33" stroke="#111827" stroke-width="3" />
        <text x="-26" y="8" fill="#111827" font-size="18" font-weight="900" font-family="Inter, sans-serif">WOW</text>
      </g>
    `);
  }

  if (state.accessories.has("crown")) {
    parts.push(`
      <g transform="translate(600 196)">
        <path d="M-52 52 L-38 8 L-10 34 L8 -4 L28 36 L58 8 L52 52 Z" fill="url(#visorGold)" stroke="#DE8E00" stroke-width="4" stroke-linejoin="round" />
        <circle cx="-38" cy="8" r="6" fill="#FFB31A" />
        <circle cx="8" cy="-4" r="6" fill="#FFB31A" />
        <circle cx="58" cy="8" r="6" fill="#FFB31A" />
      </g>
    `);
  }

  if (state.accessories.has("visor")) {
    parts.push(`
      <g transform="translate(597 340)">
        <path d="M-76 -8 C-50 -42 50 -42 76 -8 L56 24 C22 10 -22 10 -56 24 Z" fill="#D42525" />
        <path d="M-86 6 C-66 -26 -18 -50 0 -50 C18 -50 66 -26 86 6 L56 26 C24 14 -24 14 -56 26 Z" fill="url(#visorGold)" stroke="#DE8E00" stroke-width="4" />
        <path d="M-14 -24 L18 -10 L2 12 L-26 2 Z" fill="#FFD246" />
      </g>
    `);
  }

  if (state.accessories.has("badge")) {
    parts.push(`
      <g transform="translate(597 470)">
        <circle cx="0" cy="-20" r="11" fill="#FFAB2D" stroke="#111827" stroke-width="3" />
        <path d="M-30 10 L0 -6 L30 10 L16 22 L-16 22 Z" fill="url(#visorGold)" stroke="#111827" stroke-width="3" />
        <path d="M-14 6 L0 22 L14 6" fill="none" stroke="#111827" stroke-width="3" stroke-linecap="round" />
      </g>
    `);
  }

  if (state.accessories.has("lightning")) {
    parts.push(`
      <path d="M606 544 L572 622 L602 622 L568 696 L648 604 L614 604 L642 544 Z" fill="#FFDF31" stroke="#111827" stroke-width="4" stroke-linejoin="round" />
    `);
  }

  if (state.accessories.has("belt")) {
    parts.push(`
      <g transform="translate(598 676)">
        <rect x="-84" y="-12" width="168" height="24" rx="12" fill="url(#beltGold)" stroke="#C78107" stroke-width="4" />
        <rect x="-22" y="-17" width="44" height="34" rx="10" fill="#FFD96F" stroke="#C78107" stroke-width="4" />
      </g>
    `);
  }

  if (state.accessories.has("trail")) {
    parts.push(`
      <g transform="translate(774 650) rotate(-12)">
        <path d="M0 0 C28 -14 54 -34 84 -78 C56 -70 29 -57 2 -38 Z" fill="url(#starTail)" opacity="0.9" />
        <path d="M0 -2 L10 -20 L30 -20 L14 -32 L20 -52 L0 -40 L-20 -52 L-14 -32 L-30 -20 L-10 -20 Z" fill="#FFBF3B" stroke="#EF6C24" stroke-width="4" stroke-linejoin="round" />
      </g>
    `);
  }

  if (state.accessories.has("bubble")) {
    parts.push(`
      <g transform="translate(724 156)">
        <path d="M0 0 C0 -36 32 -62 80 -62 C126 -62 156 -36 156 0 C156 34 126 58 84 58 L58 82 L62 56 C24 51 0 30 0 0 Z" fill="url(#bubbleBlue)" opacity="0.92" />
        <circle cx="54" cy="0" r="7" fill="#ffffff" />
        <circle cx="80" cy="0" r="7" fill="#ffffff" />
        <circle cx="106" cy="0" r="7" fill="#ffffff" />
      </g>
    `);
  }

  return parts.join("");
}

function renderStudentBlob() {
  return `
    <g transform="translate(142 348)">
      <circle cx="116" cy="188" r="112" fill="url(#studentSkin)" filter="url(#softShadow)" />
      <path d="M47 283 C76 250 157 247 194 288 L224 462 H28 Z" fill="url(#studentShirt)" />
      <path d="M58 318 C114 290 156 289 207 316" fill="none" stroke="#4A86FF" stroke-width="10" stroke-linecap="round" opacity="0.7" />
      <path d="M52 356 C108 328 159 327 214 354" fill="none" stroke="#4A86FF" stroke-width="10" stroke-linecap="round" opacity="0.7" />
      <path d="M74 255 C94 238 132 233 160 242" fill="none" stroke="#B41A18" stroke-width="16" stroke-linecap="round" />
      <path d="M40 260 C58 246 83 244 101 249" fill="none" stroke="#B41A18" stroke-width="16" stroke-linecap="round" />
      <path d="M197 252 C234 260 269 296 282 344 L253 354 C245 332 225 306 194 283 Z" fill="url(#studentSkin)" />
      <path d="M252 352 L268 346 L282 384 L264 392 Z" fill="#E32835" />
      <path d="M262 344 L275 340 L288 372 L273 378 Z" fill="#101625" />
      <path d="M122 182 C145 157 184 169 183 210" fill="none" stroke="#101625" stroke-width="7" stroke-linecap="round" />
      <path d="M168 153 C174 140 190 137 201 146" fill="none" stroke="#101625" stroke-width="7" stroke-linecap="round" />
      <circle cx="177" cy="214" r="18" fill="#7EA9FF" opacity="0.88" />
      <circle cx="188" cy="211" r="7" fill="#ffffff" />
      <circle cx="195" cy="214" r="3" fill="#151522" />
      <ellipse cx="197" cy="245" rx="34" ry="26" fill="#FF8DA8" opacity="0.9" />
      <path d="M228 262 C243 248 261 246 274 252 C266 266 251 278 234 280 Z" fill="#101625" />
      <path d="M245 274 C252 284 256 293 255 304 C243 300 234 292 229 282 Z" fill="#E32835" />
      <path d="M188 239 l4 -6" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
      <path d="M198 244 l4 -6" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
      <path d="M208 250 l4 -6" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
    </g>
  `;
}

function renderDolMark(x, y, scale) {
  return `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <path d="M27.3475 10.2859C20.9279 7.26758 12.3458 9.93899 7.75067 12.4022C7.6831 12.4369 7.58174 12.4716 7.51416 12.5063C19.948 7.05941 27.111 9.80022 29.6113 11.639L29.2735 11.3961C28.8342 11.0492 28.1585 10.6676 27.3475 10.2859Z" fill="#D42525" />
      <path opacity="0.3" d="M16.569 22.4632C16.6703 22.3244 16.569 23.1918 16.1297 24.0938C15.5216 25.4122 14.3728 26.9387 15.0485 26.8693C15.8932 26.7652 16.6366 26.5224 17.2785 26.2448C19.0693 25.4122 20.1505 24.0938 20.8262 22.8448C21.5696 21.3183 21.7047 19.8959 21.8399 19.5489C22.0764 18.8204 21.6371 17.8489 25.7592 16.4959C25.793 16.4959 25.8268 16.4959 25.8268 16.4612C22.9211 16.4612 11.1292 17.1551 5.21631 36.0631C9.16947 27.9795 16.3663 22.706 16.569 22.4632Z" fill="#D42525" />
      <path d="M32.9559 15.4899C32.9222 15.3512 32.6519 15.0389 32.5167 15.1083C31.2328 15.5593 28.8 15.594 25.8943 16.5308H25.8605H25.8267C25.1848 16.7389 24.6442 16.9471 24.2049 17.1206C24.036 17.1899 23.867 17.2593 23.7319 17.3634C21.8736 18.3001 22.1101 19.0287 21.9074 19.5838C21.9074 19.6185 21.8736 19.6879 21.8736 19.7573C21.8736 19.8267 21.8398 19.9307 21.806 20.0348C21.7722 20.1389 21.7722 20.243 21.7384 20.3471C21.7384 20.3818 21.7384 20.3818 21.7384 20.4165C21.7046 20.5205 21.6708 20.6593 21.6708 20.7634C21.6708 20.7981 21.6708 20.7981 21.6708 20.8328C21.6371 20.9716 21.6033 21.1103 21.5695 21.2491C21.5695 21.2838 21.5695 21.2838 21.5357 21.3185C21.5019 21.4573 21.4343 21.6307 21.4005 21.7695C21.4005 21.8042 21.4005 21.8042 21.3668 21.8389C21.2992 22.0124 21.2654 22.1511 21.164 22.3246V22.3593C20.5221 23.8858 19.3057 25.6205 16.873 26.4879C16.873 26.4879 16.873 26.4879 16.8392 26.4879C16.6703 26.5572 16.5351 26.5919 16.3662 26.6266C16.3324 26.6266 16.3324 26.6266 16.2986 26.6613C16.1297 26.696 15.9945 26.7307 15.8256 26.7654C15.7918 26.7654 15.758 26.7654 15.7242 26.8001C15.5215 26.8348 15.3188 26.8695 15.116 26.9042C14.9809 26.9389 14.9133 26.8695 14.9133 26.8001C14.8795 26.5225 15.3525 25.7246 15.8256 24.8919C15.9607 24.6491 16.0959 24.3715 16.1972 24.1287C16.4337 23.643 16.5689 23.192 16.6027 22.8797C16.6365 22.6715 16.6703 22.5328 16.6365 22.4981H16.6027C16.3662 22.7062 9.16939 27.9797 5.21622 36.0633C5.21622 36.0286 5.25001 35.9939 5.25001 35.9592C5.14865 36.2021 5.0135 36.445 4.91213 36.6878C4.84456 36.8266 4.94592 37.0001 5.08107 37.0001H15.9945C20.9951 37.0001 25.1848 35.3694 28.496 32.0735C31.8072 28.7776 33.4965 24.7532 33.4965 20.0001C33.5303 18.4042 33.3276 16.9124 32.9559 15.4899Z" fill="#D42525" />
      <path d="M28.5299 7.92651C25.2187 4.6306 21.0628 3 16.0284 3H4.20273C4.10136 3 4 3.10408 4 3.20816V9.00201C4 10.0081 4.30409 10.9796 4.91227 11.7775C5.62181 12.6795 6.56787 13.0959 7.78422 12.4367C12.3456 9.97344 20.9276 7.30202 27.3811 10.3204C27.55 10.3898 27.6852 10.4591 27.8541 10.5632C28.4623 10.8755 28.9353 11.153 29.3408 11.4306L29.6787 11.6734C29.6787 11.6734 29.6449 11.6734 29.6449 11.6387C30.422 12.2285 30.7937 12.7142 30.9288 12.853C30.9626 12.8877 30.9964 12.9224 31.064 12.9224C31.2329 12.9571 31.7059 13.0265 32.2127 13.1653C31.3343 11.2571 30.1517 9.48773 28.5299 7.92651Z" fill="#D42525" />
      <text x="44" y="26" fill="#334155" font-size="16" font-weight="800" font-family="Inter, sans-serif">DOL</text>
    </g>
  `;
}

function renderTextBlock({
  lines,
  x,
  y,
  color,
  size,
  family,
  anchor = "start",
  opacity = 1,
  weight = 700,
  rotate = 0,
}) {
  const lineHeight = Math.round(size * 1.02);
  const transform = rotate ? ` transform="rotate(${rotate} ${x} ${y})"` : "";

  return `
    <text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="${family}" font-weight="${weight}" text-anchor="${anchor}" opacity="${opacity}"${transform}>
      ${lines
        .map((line, index) => {
          const dy = index === 0 ? 0 : lineHeight;
          return `<tspan x="${x}" dy="${dy}">${escapeHtml(line)}</tspan>`;
        })
        .join("")}
    </text>
  `;
}

function fitTextLayout(value, { maxChars, maxLines, baseSize, minSize }) {
  const lines = wrapText(value, maxChars, maxLines);
  const longest = Math.max(...lines.map((line) => line.length), 0);
  const overflowPenalty = Math.max(0, longest - Math.floor(maxChars * 0.7)) * 1.4;
  const linePenalty = Math.max(0, lines.length - 1) * 3.4;
  const size = clamp(baseSize - overflowPenalty - linePenalty, minSize, baseSize);

  return {
    lines,
    size,
  };
}

function getDisplayText(key) {
  const raw = (state[key] || "").trim();
  return {
    value: raw || placeholderCopy[key],
    placeholder: !raw,
  };
}

function wrapText(value, maxChars, maxLines) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ").flatMap((word) => {
    if (word.length <= maxChars) {
      return [word];
    }

    const pieces = [];
    for (let index = 0; index < word.length; index += maxChars) {
      pieces.push(word.slice(index, index + maxChars));
    }
    return pieces;
  });

  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }

    if (current) {
      lines.push(current);
    }
    current = word;
  });

  if (current) {
    lines.push(current);
  }

  if (lines.length <= maxLines) {
    return lines;
  }

  const limited = lines.slice(0, maxLines);
  const lastLine = limited[maxLines - 1];
  limited[maxLines - 1] =
    lastLine.length >= maxChars ? `${lastLine.slice(0, maxChars - 1)}…` : `${lastLine}…`;
  return limited;
}

function randomizeAccessories() {
  const nextSet = new Set();
  const shuffled = [...accessoryCatalog]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);

  const count = 3 + Math.floor(Math.random() * 3);
  shuffled.slice(0, count).forEach((item) => nextSet.add(item.id));
  state.accessories = nextSet;

  refs.accessoryInputs.forEach((input) => {
    input.checked = state.accessories.has(input.dataset.accessory);
  });

  renderApp();
}

async function downloadScene(type) {
  const svgElement = refs.scenePreviews[0]?.querySelector("svg");
  if (!svgElement) {
    return;
  }

  const serialized = new XMLSerializer().serializeToString(svgElement);
  const svgMarkup = serialized.startsWith("<svg")
    ? serialized
    : `<svg xmlns="http://www.w3.org/2000/svg">${serialized}</svg>`;

  if (type === "svg") {
    downloadBlob(
      new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" }),
      buildDownloadName("svg"),
    );
    return;
  }

  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1230;
    const context = canvas.getContext("2d");
    context.fillStyle = "#F8FAFC";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    downloadBlob(pngBlob, buildDownloadName("png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function downloadBlob(blob, fileName) {
  if (!blob) {
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildDownloadName(extension) {
  const safeName = `${state.student.name || "student"}-${state.student.classCode || "class"}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `me-in-the-mirror-${safeName || "poster"}.${extension}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
