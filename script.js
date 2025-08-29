
const GOOGLE_TRANSLATE_API = "https://translate.googleapis.com/translate_a/single";
const GOOGLE_INPUT_API = "https://inputtools.google.com/request?itc=hi-t-i0-und&num=1";

const inputEl = document.getElementById("inputText");
const sourceEl = document.getElementById("sourceLang");
const targetEl = document.getElementById("targetLang");
const outEl = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");
const copyBtn = document.getElementById("copyBtn");
const speakBtn = document.getElementById("speakBtn");
const swapBtn = document.getElementById("swapBtn");

// Event listeners
translateBtn.addEventListener("click", translateText);
copyBtn.addEventListener("click", copyText);
speakBtn.addEventListener("click", speakText);
swapBtn.addEventListener("click", swapLanguages);

// ---- Translate Text ----
async function translateText() {
  let text = inputEl.value.trim();
  let from = sourceEl.value;
  const to = targetEl.value;

  if (!text) {
    alert("Please enter text to translate!");
    return;
  }

  outEl.textContent = "Translating…";

  try {
    // Auto-detect Roman Hindi when source is Hindi
    if (from === "hi" && /[a-zA-Z]/.test(text)) {
      text = await transliterateToHindi(text);
      console.log("After Transliteration:", text);
    }

    const translated = await translateWithGoogle(text, from, to);
    outEl.textContent = translated || "(No translation returned)";
  } catch (err) {
    console.error("Translation error:", err);
    outEl.textContent = " Translation failed. Check console for details.";
  }
}

// ---- Google Free Translate ----
async function translateWithGoogle(text, from, to) {
  const url = `${GOOGLE_TRANSLATE_API}?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Google Translate API error: " + res.status);
  const data = await res.json();
  return data[0].map(item => item[0]).join(" ");
}

// ---- Transliteration: Roman Hindi → Devanagari ----
async function transliterateToHindi(text) {
  const res = await fetch(GOOGLE_INPUT_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "text=" + encodeURIComponent(text),
  });

  const data = await res.json();
  if (data[0] === "SUCCESS") {
    return data[1][0][1][0]; // First suggestion
  }
  return text; // fallback if no conversion
}

// ---- Copy to Clipboard ----
function copyText() {
  const txt = outEl.textContent.trim();
  if (!txt) return;
  navigator.clipboard.writeText(txt).then(() => {
    alert("Copied to clipboard!");
  });
}

// ---- Text to Speech ----
function speakText() {
  const txt = outEl.textContent.trim();
  if (!txt) return;
  const utter = new SpeechSynthesisUtterance(txt);
  utter.lang = targetEl.value || "en";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// ---- Swap Languages ----
function swapLanguages() {
  const tmp = sourceEl.value;
  sourceEl.value = targetEl.value;
  targetEl.value = tmp === "auto" ? targetEl.value : tmp;

  const currentOut = outEl.textContent.trim();
  if (currentOut && currentOut !== "Translated text will appear here...") {
    inputEl.value = currentOut;
    outEl.textContent = "";
  }
}


// “In this project, I use JavaScript to handle user input,
//  send it to a translation API (LibreTranslate) using fetch(),
//  wait for the response using async/await, and update the DOM with the translated text. 
// I also handle errors to ensure smooth UX. Event listeners and JSON parsing are key parts of the implementation.”