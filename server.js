const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

loadEnvFile(path.join(__dirname, ".env.local"));

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const ACCESSORY_PROMPTS = {
  visor: "a bold red and gold hero visor mask",
  crown: "a shiny golden crown floating above the hero",
  comic: "a playful comic burst sticker near the upper mirror corner",
  lightning: "a yellow lightning symbol on the hero outfit",
  belt: "a gold victory belt around the waist",
  badge: "a winged badge on the chest",
  trail: "a bright star trail decoration near the lower side of the mirror",
  bubble: "a blue speech bubble decoration near the hero",
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, {
        ok: true,
        model: GEMINI_MODEL,
        hasGeminiKey: Boolean(GEMINI_API_KEY),
      });
    }

    if (req.method === "POST" && url.pathname === "/api/generate-image") {
      const payload = await readJsonBody(req);
      const validationError = validatePayload(payload);
      if (validationError) {
        return json(res, 400, { error: validationError });
      }

      if (!GEMINI_API_KEY) {
        return json(res, 500, {
          error:
            "Missing GEMINI_API_KEY. Add it to your environment or create a .env.local file.",
        });
      }

      const prompt = buildImagePrompt(payload);
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          GEMINI_MODEL,
        )}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: {
                aspectRatio: "4:3",
              },
            },
          }),
        },
      );

      const raw = await geminiResponse.json();
      if (!geminiResponse.ok) {
        return json(res, geminiResponse.status, {
          error:
            raw?.error?.message ||
            raw?.message ||
            "Gemini API request failed while generating the image.",
        });
      }

      const imagePart = extractImagePart(raw);
      if (!imagePart) {
        return json(res, 502, {
          error: "Gemini returned no image data.",
          details: extractTextParts(raw),
        });
      }

      return json(res, 200, {
        imageBase64: imagePart.data,
        mimeType: imagePart.mimeType || "image/png",
        prompt,
        model: GEMINI_MODEL,
      });
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      return json(res, 405, { error: "Method not allowed." });
    }

    return serveStatic(url.pathname, res, req.method === "HEAD");
  } catch (error) {
    return json(res, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error.",
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Me In The Mirror server running on http://${HOST}:${PORT}`);
});

function buildImagePrompt(payload) {
  const studentText =
    payload.student.gender === "girl"
      ? "a cute young school-age girl with child proportions, human arms and legs, a clear girl hairstyle, and a friendly face"
      : "a cute young school-age boy with child proportions, human arms and legs, a clear boy hairstyle, and a friendly face";
  const genderText =
    payload.student.gender === "girl"
      ? "a female superhero with long hair"
      : "a male superhero with short hair";
  const upgradePhrase = `${payload.weakness} => ${payload.better}`;

  const accessoryPrompts = (payload.accessories || [])
    .map((id) => ACCESSORY_PROMPTS[id])
    .filter(Boolean);

  const accessoryText = accessoryPrompts.length
    ? `Add these accessories to the hero only: ${accessoryPrompts.join(", ")}.`
    : "Do not add extra accessories beyond the base hero costume.";

  return [
    "Create one polished 4:3 educational illustration poster for a classroom activity called Me In The Mirror.",
    `The scene must show ${studentText} standing outside a tall mirror and looking into it while holding a marker.`,
    "The student outside the mirror must match the selected gender of the hero inside the mirror.",
    "The student outside the mirror must be a human child character, not a blob, bean, mascot, abstract oval creature, or simplified round shape.",
    "Keep the student outside the mirror cute and kid-like, with a simple school outfit and readable silhouette.",
    "Keep a stable classroom-poster composition: the mirror should sit slightly left of center, the hero should be full-body inside the mirror, and the background should stay simple and airy.",
    `Inside the mirror is ${genderText}, shown as a clean superhero with a white outfit and a red cape.`,
    "Keep the composition airy, bright, premium, kid-friendly, and highly legible.",
    "Use a playful but neat illustration style with rounded shapes, soft lighting, a bright classroom poster vibe, and subtle DOL-inspired red and blue accents.",
    "Do not include app UI, buttons, input boxes, browser chrome, or instruction panels.",
    accessoryText,
    `Write exactly this large blue handwritten text on the hero shirt chest area: "${payload.proud}".`,
    "Behind that proud text, add a soft white or pale-blue sticker bubble or rounded label so the shirt text stands out clearly from the outfit.",
    `Write exactly this large black handwritten text on the upper-right mirror glass area: "${payload.myth}".`,
    `Write exactly this large grouped handwritten upgrade phrase on the lower-right cape area: "${upgradePhrase}".`,
    `Inside that grouped upgrade phrase, render "${payload.weakness}" in red, render the arrow "=>" clearly in the middle, and render "${payload.better}" in blue.`,
    "The full upgrade phrase must stay together as one connected unit. Do not separate the weakness word and the change word into different places.",
    `Prefer a single clear line for the full phrase "${upgradePhrase}". If a line break is absolutely necessary, keep the arrow visually attached between the two parts so the change still reads as one phrase.`,
    "Behind the full upgrade phrase, add one shared light callout bubble, sticker, or rounded label so the whole phrase is highlighted together and does not sink into the red cape.",
    "Make the handwritten text noticeably large, bold, and easy to read from a distance like a classroom poster.",
    "Prioritize text legibility over extra decoration.",
    "Keep all requested words readable, balanced, and fully inside the correct visual areas.",
    "If any phrase is long, break it into short neat handwritten lines instead of letting words overlap.",
    "Do not let the text overlap the face, hands, or accessories.",
    "Do not add any extra words, slogans, labels, captions, logos, or watermarks beyond the exact requested text.",
    "The final image must already contain the text and the accessories directly in the artwork.",
  ].join(" ");
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Invalid request body.";
  }

  if (!payload.student || typeof payload.student !== "object") {
    return "Missing student data.";
  }

  if (!String(payload.student.name || "").trim()) {
    return "Missing student name.";
  }

  if (!String(payload.student.classCode || "").trim()) {
    return "Missing class code.";
  }

  if (!["boy", "girl"].includes(payload.student.gender)) {
    return "Invalid gender.";
  }

  if (!Array.isArray(payload.accessories)) {
    return "Accessories must be an array.";
  }

  return "";
}

function extractImagePart(responseJson) {
  const candidates = responseJson?.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      const inlineData = part.inlineData || part.inline_data;
      if (inlineData?.data) {
        return {
          data: inlineData.data,
          mimeType: inlineData.mimeType || inlineData.mime_type,
        };
      }
    }
  }
  return null;
}

function extractTextParts(responseJson) {
  const candidates = responseJson?.candidates || [];
  const textParts = [];
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts || [];
    for (const part of parts) {
      if (part.text) {
        textParts.push(part.text);
      }
    }
  }
  return textParts.join("\n").trim();
}

async function serveStatic(urlPathname, res, headOnly) {
  const safePath = sanitizePath(urlPathname);
  let filePath = path.join(__dirname, safePath);

  if (safePath === "/") {
    filePath = path.join(__dirname, "index.html");
  }

  if (!filePath.startsWith(__dirname)) {
    return json(res, 403, { error: "Forbidden." });
  }

  try {
    const stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const data = headOnly ? null : await fs.promises.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch {
    json(res, 404, { error: "Not found." });
  }
}

function sanitizePath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname);
  return decoded === "/" ? "/" : path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", reject);
  });
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalIndex = line.indexOf("=");
    if (equalIndex < 0) {
      continue;
    }

    const key = line.slice(0, equalIndex).trim();
    let value = line.slice(equalIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
