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
  myth: "selfish",
  weakness: "quiet",
  better: "talkative",
};

const refs = {
  landingScreen: document.getElementById("landingScreen"),
  builderScreen: document.getElementById("builderScreen"),
  landingForm: document.getElementById("landingForm"),
  studentName: document.getElementById("studentName"),
  classCode: document.getElementById("classCode"),
  landingError: document.getElementById("landingError"),
  proudInput: document.getElementById("proudInput"),
  mythInput: document.getElementById("mythInput"),
  weaknessInput: document.getElementById("weaknessInput"),
  betterInput: document.getElementById("betterInput"),
  studentSummary: document.getElementById("studentSummary"),
  activeAccessoryCount: document.getElementById("activeAccessoryCount"),
  scenePreview: document.getElementById("scenePreview"),
  backButton: document.getElementById("backButton"),
  randomizeButton: document.getElementById("randomizeButton"),
  downloadSvgButton: document.getElementById("downloadSvgButton"),
  downloadPngButton: document.getElementById("downloadPngButton"),
  accessoryInputs: Array.from(document.querySelectorAll("[data-accessory]")),
};

const state = {
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
  refs.backButton.addEventListener("click", goBackToLanding);
  refs.randomizeButton.addEventListener("click", randomizeAccessories);
  refs.downloadSvgButton.addEventListener("click", () => downloadScene("svg"));
  refs.downloadPngButton.addEventListener("click", () => downloadScene("png"));

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

  refs.landingScreen.classList.add("hidden");
  refs.builderScreen.classList.remove("hidden");
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleFieldInput() {
  state.proud = refs.proudInput.value;
  state.myth = refs.mythInput.value;
  state.weakness = refs.weaknessInput.value;
  state.better = refs.betterInput.value;
  renderApp();
}

function goBackToLanding() {
  refs.builderScreen.classList.add("hidden");
  refs.landingScreen.classList.remove("hidden");
  refs.studentName.focus();
}

function renderApp() {
  refs.studentSummary.innerHTML = buildStudentSummary();
  refs.activeAccessoryCount.textContent = `${state.accessories.size} phụ kiện`;
  refs.scenePreview.innerHTML = buildSceneSvg();
}

function buildStudentSummary() {
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
  const accessoryLabels = accessoryCatalog
    .filter((item) => state.accessories.has(item.id))
    .map((item) => item.label);

  const proudLines = wrapText(proud.value, 16, 2);
  const mythLines = wrapText(myth.value, 14, 2);
  const weaknessLines = wrapText(weakness.value, 12, 2);
  const betterLines = wrapText(better.value, 13, 2);
  const studentNameLines = wrapText(state.student.name || "Student", 16, 2);
  const heroCallout = buildHeroCallout();

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 820" role="img" aria-label="Me In The Mirror poster for ${escapeHtml(state.student.name)}">
      <defs>
        <linearGradient id="posterBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fffaf2" />
          <stop offset="100%" stop-color="#fff2e1" />
        </linearGradient>
        <linearGradient id="bannerGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#f43e3e" />
          <stop offset="100%" stop-color="#ff772d" />
        </linearGradient>
        <linearGradient id="mirrorFrame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffcd78" />
          <stop offset="100%" stop-color="#ff9e3d" />
        </linearGradient>
        <linearGradient id="mirrorGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fbfdff" />
          <stop offset="60%" stop-color="#e7ecff" />
          <stop offset="100%" stop-color="#dff5ff" />
        </linearGradient>
        <linearGradient id="studentSkin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3758d2" />
          <stop offset="100%" stop-color="#213f8e" />
        </linearGradient>
        <linearGradient id="studentShirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3756ff" />
          <stop offset="100%" stop-color="#3b2cb5" />
        </linearGradient>
        <linearGradient id="capeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff5fb" />
          <stop offset="100%" stop-color="#ffe0ec" />
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
          <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#31223c" flood-opacity="0.16" />
        </filter>
        <clipPath id="mirrorClip">
          <path d="M418 696 V178 C418 121 460 88 526 88 H578 C644 88 688 121 688 178 V696 Z" />
        </clipPath>
      </defs>

      <rect width="1280" height="820" fill="#fffdf8" />
      <rect x="16" y="16" width="1248" height="788" rx="34" fill="url(#posterBg)" stroke="#f1452f" stroke-width="10" />
      <rect x="16" y="16" width="1248" height="74" rx="34" fill="url(#bannerGrad)" />
      <text x="48" y="64" fill="#ffffff" font-size="46" font-weight="900" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">01 | ME IN THE MIRROR</text>

      <g transform="translate(44 112)">
        <rect x="0" y="0" width="744" height="650" rx="30" fill="rgba(255,255,255,0.65)" stroke="rgba(241, 69, 47, 0.12)" />
        <rect x="40" y="42" width="214" height="610" rx="28" fill="url(#studentShirt)" opacity="0.78" />
        <g opacity="0.8">
          <path d="M98 86 l30 -28" stroke="#7257c8" stroke-width="6" stroke-linecap="round" />
          <path d="M91 77 c18 -13 35 5 26 18 c-8 11 -28 0 -26 -18 z" fill="none" stroke="#7257c8" stroke-width="4" />
          <path d="M117 165 l54 30" stroke="#c0dcff" stroke-width="12" stroke-linecap="round" />
          <circle cx="176" cy="196" r="20" fill="none" stroke="#c0dcff" stroke-width="10" />
          <path d="M96 246 l28 -28" stroke="#504ee3" stroke-width="6" stroke-linecap="round" />
          <path d="M90 236 c18 -13 35 5 26 18 c-8 11 -28 0 -26 -18 z" fill="none" stroke="#504ee3" stroke-width="4" />
          <path d="M78 504 l40 22" stroke="#5240cf" stroke-width="12" stroke-linecap="round" />
          <path d="M132 548 l30 -30" stroke="#6f5cf0" stroke-width="10" stroke-linecap="round" />
        </g>

        <path d="M394 708 V176 C394 102 450 56 530 56 H578 C658 56 714 102 714 176 V708 Z" fill="url(#mirrorFrame)" filter="url(#softShadow)" />
        <path d="M418 696 V178 C418 121 460 88 526 88 H578 C644 88 688 121 688 178 V696 Z" fill="url(#mirrorGlass)" />
        <g opacity="0.52">
          <path d="M469 92 L552 694" stroke="#ffffff" stroke-width="22" />
          <path d="M566 98 L654 702" stroke="#ffffff" stroke-width="16" />
        </g>

        <g clip-path="url(#mirrorClip)">
          <rect x="418" y="88" width="270" height="608" fill="rgba(255,255,255,0.08)" />
          <circle cx="676" cy="126" r="160" fill="rgba(255,255,255,0.18)" />
          <path d="M690 312 c48 18 80 46 114 92" fill="none" stroke="#d82438" stroke-width="4" />
          <path d="M674 342 c62 14 108 48 144 112" fill="none" stroke="#d82438" stroke-width="4" />
          ${renderTextBlock({
            lines: mythLines,
            x: 654,
            y: 158,
            color: "#121212",
            size: 38,
            family: "'Snell Roundhand', 'Brush Script MT', cursive",
            anchor: "start",
            opacity: myth.placeholder ? 0.42 : 1,
          })}
          ${renderHero(state.student.gender, proudLines, weaknessLines, betterLines, proud.placeholder, weakness.placeholder, better.placeholder)}
          ${renderSceneAccessories(heroCallout)}
        </g>

        ${renderStudentBlob()}
      </g>

      <g transform="translate(818 118)">
        <text x="0" y="120" fill="#ff7e29" font-size="92" font-family="'Snell Roundhand', 'Brush Script MT', cursive">Me In</text>
        <text x="0" y="210" fill="#ff7e29" font-size="92" font-family="'Snell Roundhand', 'Brush Script MT', cursive">The Mirror</text>

        <g transform="translate(0 250)">
          <rect x="0" y="0" width="406" height="118" rx="26" fill="rgba(255,255,255,0.9)" stroke="rgba(32,24,36,0.12)" />
          <text x="26" y="34" fill="#d63c44" font-size="18" font-weight="900" font-family="'Avenir Next', 'Trebuchet MS', sans-serif" letter-spacing="1.5">STUDENT PROFILE</text>
          ${renderTextBlock({
            lines: studentNameLines,
            x: 26,
            y: 74,
            color: "#201824",
            size: 28,
            family: "'Avenir Next', 'Trebuchet MS', sans-serif",
            weight: 800,
          })}
          <text x="26" y="102" fill="#6b6574" font-size="20" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">${escapeHtml(
            state.student.classCode,
          )} • ${state.student.gender === "girl" ? "Girl Hero" : "Boy Hero"}</text>
        </g>

        <g transform="translate(0 392)">
          <rect x="0" y="0" width="406" height="196" rx="26" fill="rgba(255,255,255,0.9)" stroke="rgba(32,24,36,0.12)" />
          <text x="28" y="34" fill="#201824" font-size="22" font-weight="800" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">How the words map</text>
          <circle cx="28" cy="68" r="8" fill="#3467d8" />
          <text x="48" y="74" fill="#201824" font-size="18" font-weight="700" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">The Proud</text>
          <text x="176" y="74" fill="#3467d8" font-size="18" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">${escapeHtml(
            proud.value,
          )}</text>
          <text x="48" y="98" fill="#6b6574" font-size="16" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">Viết trên áo bằng màu xanh.</text>

          <circle cx="28" cy="128" r="8" fill="#17141a" />
          <text x="48" y="134" fill="#201824" font-size="18" font-weight="700" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">The Myth</text>
          <text x="170" y="134" fill="#17141a" font-size="18" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">${escapeHtml(
            myth.value,
          )}</text>
          <text x="48" y="158" fill="#6b6574" font-size="16" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">Viết trên gương bằng màu đen.</text>

          <circle cx="28" cy="188" r="8" fill="#ef5a48" />
          <text x="48" y="194" fill="#201824" font-size="18" font-weight="700" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">The Upgrade</text>
          <text x="196" y="194" fill="#ef5a48" font-size="18" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">${escapeHtml(
            weakness.value,
          )}</text>
          <text x="262" y="194" fill="#201824" font-size="18" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">→</text>
          <text x="282" y="194" fill="#3467d8" font-size="18" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">${escapeHtml(
            better.value,
          )}</text>
        </g>

        <g transform="translate(0 610)">
          <rect x="0" y="0" width="406" height="130" rx="26" fill="rgba(255,255,255,0.9)" stroke="rgba(32,24,36,0.12)" />
          <text x="28" y="34" fill="#201824" font-size="22" font-weight="800" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">Accessories</text>
          ${renderAccessoryPills(accessoryLabels)}
        </g>
      </g>
    </svg>
  `;
}

function renderHero(
  gender,
  proudLines,
  weaknessLines,
  betterLines,
  proudPlaceholder,
  weaknessPlaceholder,
  betterPlaceholder,
) {
  const hair = gender === "girl" ? renderGirlHair() : renderBoyHair();

  return `
    <g transform="translate(0 10)">
      <path d="M515 446 C546 425 626 425 657 446 L719 703 C650 732 524 734 452 703 Z" fill="url(#capeGradient)" stroke="#d42743" stroke-width="4" />
      <path d="M520 445 C552 432 619 432 649 445" fill="none" stroke="#d42743" stroke-width="4" />
      <path d="M517 460 c26 -18 52 -26 72 -24 c22 0 44 8 76 24" fill="none" stroke="#d42743" stroke-width="4" />

      ${hair.back}
      <ellipse cx="585" cy="350" rx="94" ry="112" fill="#fffdfb" stroke="#201824" stroke-width="4" />
      <path d="M523 447 Q585 430 647 447 L629 708 Q585 729 541 708 Z" fill="#fffdfb" stroke="#201824" stroke-width="4" />
      <path d="M520 487 C468 535 459 607 475 655 L513 640 C500 592 507 548 543 508 Z" fill="#fffdfb" stroke="#201824" stroke-width="4" />
      <path d="M650 487 C702 535 711 607 695 655 L657 640 C670 592 663 548 627 508 Z" fill="#fffdfb" stroke="#201824" stroke-width="4" />
      <path d="M534 690 C556 706 612 708 636 690" fill="none" stroke="#201824" stroke-width="4" stroke-linecap="round" />
      <path d="M519 651 c-15 15 -34 24 -52 28" fill="none" stroke="#201824" stroke-width="4" stroke-linecap="round" />
      <path d="M651 651 c15 15 34 24 52 28" fill="none" stroke="#201824" stroke-width="4" stroke-linecap="round" />
      <ellipse cx="553" cy="351" rx="14" ry="26" fill="#1b1120" />
      <ellipse cx="611" cy="351" rx="14" ry="26" fill="#1b1120" />
      <path d="M548 412 C569 428 603 428 624 412" fill="none" stroke="#1b1120" stroke-width="4" stroke-linecap="round" />
      <path d="M517 450 l25 -20 l42 18" fill="none" stroke="#d42743" stroke-width="4" stroke-linecap="round" />
      <path d="M654 450 l-25 -20 l-42 18" fill="none" stroke="#d42743" stroke-width="4" stroke-linecap="round" />
      <path d="M560 430 c10 22 40 22 50 0" fill="none" stroke="#d42743" stroke-width="4" stroke-linecap="round" />
      <rect x="573" y="427" width="24" height="20" rx="8" fill="#fffdfb" stroke="#d42743" stroke-width="4" />
      ${hair.front}

      ${renderTextBlock({
        lines: proudLines,
        x: 585,
        y: 550,
        color: "#3467d8",
        size: 26,
        family: "'Snell Roundhand', 'Brush Script MT', cursive",
        anchor: "middle",
        opacity: proudPlaceholder ? 0.46 : 1,
      })}

      ${renderTextBlock({
        lines: weaknessLines,
        x: 646,
        y: 662,
        color: "#ef5a48",
        size: 25,
        family: "'Snell Roundhand', 'Brush Script MT', cursive",
        anchor: "start",
        rotate: -3,
        opacity: weaknessPlaceholder ? 0.46 : 1,
      })}
      <text x="645" y="710" fill="#201824" font-size="30" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">⇒</text>
      ${renderTextBlock({
        lines: betterLines,
        x: 674,
        y: 704,
        color: "#3467d8",
        size: 30,
        family: "'Snell Roundhand', 'Brush Script MT', cursive",
        anchor: "start",
        rotate: -3,
        opacity: betterPlaceholder ? 0.46 : 1,
      })}
    </g>
  `;
}

function renderBoyHair() {
  return {
    back: `
      <path d="M492 310 C500 254 551 226 617 236 C672 245 697 287 686 350 C666 322 627 301 585 301 C544 301 514 314 492 347 Z" fill="#1b1722" />
    `,
    front: `
      <path d="M507 295 C523 248 579 226 638 240 C675 249 691 278 689 309 C655 294 619 287 584 286 C552 286 526 288 507 295 Z" fill="#1b1722" />
      <path d="M520 284 C542 262 570 254 600 257" fill="none" stroke="#8a5531" stroke-width="3" stroke-linecap="round" />
      <path d="M579 253 C603 246 629 247 653 260" fill="none" stroke="#8a5531" stroke-width="3" stroke-linecap="round" />
    `,
  };
}

function renderGirlHair() {
  return {
    back: `
      <path d="M655 275 C715 278 748 332 728 424 C715 488 718 586 692 629 C674 661 646 678 617 673 C641 625 651 561 650 504 C648 405 620 315 560 258 C585 241 623 239 655 275 Z" fill="#f0a13c" />
      <path d="M530 263 C566 228 631 228 666 264 C644 253 617 247 591 247 C566 247 544 251 530 263 Z" fill="#f3b44d" />
    `,
    front: `
      <path d="M517 304 C523 248 574 228 629 240 C657 247 681 264 690 312 C673 290 646 277 617 273 C586 268 551 276 517 304 Z" fill="#f3b44d" />
      <path d="M520 286 C541 266 570 257 598 260" fill="none" stroke="#ffcf82" stroke-width="3" stroke-linecap="round" />
      <path d="M571 253 C599 246 628 251 653 267" fill="none" stroke="#ffcf82" stroke-width="3" stroke-linecap="round" />
    `,
  };
}

function renderSceneAccessories(heroCallout) {
  const parts = [];

  if (state.accessories.has("comic")) {
    parts.push(`
      <g transform="translate(470 120)">
        <path d="M0 22 L22 40 L16 12 L46 0 L23 -16 L30 -44 L0 -22 L-22 -44 L-15 -16 L-46 0 L-18 12 L-24 42 Z" fill="#ff5b2d" stroke="#201824" stroke-width="3" />
        <text x="-74" y="8" fill="#241824" font-size="18" font-weight="900" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">${escapeHtml(
          heroCallout,
        )}</text>
      </g>
    `);
  }

  if (state.accessories.has("crown")) {
    parts.push(`
      <g transform="translate(588 196)">
        <path d="M-52 52 L-38 8 L-10 34 L8 -4 L28 36 L58 8 L52 52 Z" fill="url(#visorGold)" stroke="#de8e00" stroke-width="4" stroke-linejoin="round" />
        <circle cx="-38" cy="8" r="6" fill="#ffb31a" />
        <circle cx="8" cy="-4" r="6" fill="#ffb31a" />
        <circle cx="58" cy="8" r="6" fill="#ffb31a" />
      </g>
    `);
  }

  if (state.accessories.has("visor")) {
    parts.push(`
      <g transform="translate(585 340)">
        <path d="M-76 -8 C-50 -42 50 -42 76 -8 L56 24 C22 10 -22 10 -56 24 Z" fill="#d82335" />
        <path d="M-86 6 C-66 -26 -18 -50 0 -50 C18 -50 66 -26 86 6 L56 26 C24 14 -24 14 -56 26 Z" fill="url(#visorGold)" stroke="#de8e00" stroke-width="4" />
        <path d="M-14 -24 L18 -10 L2 12 L-26 2 Z" fill="#ffd246" />
      </g>
    `);
  }

  if (state.accessories.has("badge")) {
    parts.push(`
      <g transform="translate(585 470)">
        <circle cx="0" cy="-20" r="11" fill="#ffab2d" stroke="#201824" stroke-width="3" />
        <path d="M-30 10 L0 -6 L30 10 L16 22 L-16 22 Z" fill="url(#visorGold)" stroke="#201824" stroke-width="3" />
        <path d="M-14 6 L0 22 L14 6" fill="none" stroke="#201824" stroke-width="3" stroke-linecap="round" />
      </g>
    `);
  }

  if (state.accessories.has("lightning")) {
    parts.push(`
      <path d="M594 544 L560 622 L590 622 L556 696 L636 604 L602 604 L630 544 Z" fill="#ffdf31" stroke="#201824" stroke-width="4" stroke-linejoin="round" />
    `);
  }

  if (state.accessories.has("belt")) {
    parts.push(`
      <g transform="translate(586 676)">
        <rect x="-84" y="-12" width="168" height="24" rx="12" fill="url(#beltGold)" stroke="#c78107" stroke-width="4" />
        <rect x="-22" y="-17" width="44" height="34" rx="10" fill="#ffd96f" stroke="#c78107" stroke-width="4" />
      </g>
    `);
  }

  if (state.accessories.has("trail")) {
    parts.push(`
      <g transform="translate(760 646) rotate(-12)">
        <path d="M0 0 C28 -14 54 -34 84 -78 C56 -70 29 -57 2 -38 Z" fill="url(#starTail)" opacity="0.9" />
        <path d="M0 -2 L10 -20 L30 -20 L14 -32 L20 -52 L0 -40 L-20 -52 L-14 -32 L-30 -20 L-10 -20 Z" fill="#ffbf3b" stroke="#ef6c24" stroke-width="4" stroke-linejoin="round" />
      </g>
    `);
  }

  if (state.accessories.has("bubble")) {
    parts.push(`
      <g transform="translate(720 150)">
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
    <g transform="translate(138 340)">
      <circle cx="116" cy="188" r="112" fill="url(#studentSkin)" filter="url(#softShadow)" />
      <path d="M47 283 C76 250 157 247 194 288 L224 462 H28 Z" fill="url(#studentShirt)" />
      <path d="M58 318 C114 290 156 289 207 316" fill="none" stroke="#4a86ff" stroke-width="10" stroke-linecap="round" opacity="0.7" />
      <path d="M52 356 C108 328 159 327 214 354" fill="none" stroke="#4a86ff" stroke-width="10" stroke-linecap="round" opacity="0.7" />
      <path d="M74 255 C94 238 132 233 160 242" fill="none" stroke="#b41a18" stroke-width="16" stroke-linecap="round" />
      <path d="M40 260 C58 246 83 244 101 249" fill="none" stroke="#b41a18" stroke-width="16" stroke-linecap="round" />
      <path d="M197 252 C234 260 269 296 282 344 L253 354 C245 332 225 306 194 283 Z" fill="url(#studentSkin)" />
      <path d="M252 352 L268 346 L282 384 L264 392 Z" fill="#e32835" />
      <path d="M262 344 L275 340 L288 372 L273 378 Z" fill="#101625" />
      <path d="M122 182 C145 157 184 169 183 210" fill="none" stroke="#101625" stroke-width="7" stroke-linecap="round" />
      <path d="M168 153 C174 140 190 137 201 146" fill="none" stroke="#101625" stroke-width="7" stroke-linecap="round" />
      <circle cx="177" cy="214" r="18" fill="#7ea9ff" opacity="0.88" />
      <circle cx="188" cy="211" r="7" fill="#ffffff" />
      <circle cx="195" cy="214" r="3" fill="#151522" />
      <ellipse cx="197" cy="245" rx="34" ry="26" fill="#ff8da8" opacity="0.9" />
      <path d="M228 262 C243 248 261 246 274 252 C266 266 251 278 234 280 Z" fill="#101625" />
      <path d="M245 274 C252 284 256 293 255 304 C243 300 234 292 229 282 Z" fill="#e32835" />
      <path d="M188 239 l4 -6" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
      <path d="M198 244 l4 -6" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
      <path d="M208 250 l4 -6" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
    </g>
  `;
}

function renderAccessoryPills(labels) {
  if (!labels.length) {
    return `
      <text x="28" y="70" fill="#6b6574" font-size="18" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">
        Chưa chọn phụ kiện. Dùng bảng bên trái để bật thêm chi tiết.
      </text>
    `;
  }

  let x = 28;
  let y = 58;

  return labels
    .map((label) => {
      const width = Math.max(104, label.length * 9 + 28);
      if (x + width > 368) {
        x = 28;
        y += 42;
      }
      const chip = `
        <g transform="translate(${x} ${y})">
          <rect x="0" y="0" width="${width}" height="30" rx="15" fill="#fff4e6" stroke="rgba(239, 90, 72, 0.18)" />
          <text x="16" y="20" fill="#201824" font-size="15" font-family="'Avenir Next', 'Trebuchet MS', sans-serif">${escapeHtml(
            label,
          )}</text>
        </g>
      `;
      x += width + 10;
      return chip;
    })
    .join("");
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

function buildHeroCallout() {
  if (!state.student.name) {
    return state.student.gender === "girl" ? "SUPER HER" : "HERO MODE";
  }

  return `SUPER ${state.student.name.toUpperCase().slice(0, 8)}`;
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
  const svgElement = refs.scenePreview.querySelector("svg");
  if (!svgElement) {
    return;
  }

  const serialized = new XMLSerializer().serializeToString(svgElement);
  const svgMarkup = serialized.startsWith("<svg")
    ? serialized
    : `<svg xmlns="http://www.w3.org/2000/svg">${serialized}</svg>`;

  if (type === "svg") {
    downloadBlob(new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" }), buildDownloadName("svg"));
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
    context.fillStyle = "#fffdf8";
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
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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
