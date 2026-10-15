// Replace this placeholder locally. A key in a public website is not secret.
const API_KEY = "PASTE_YOUR_GEMINI_KEY_HERE";
const MODEL = "gemini-2.0-flash-lite";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// Gemini uses "user" for us and "model" for the assistant.
const history = [];
const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
let isSending = false;

function scrollToNewest() {
  chat.scrollTop = chat.scrollHeight;
}

function addMessage(text, role) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  // textContent displays text safely, rather than running HTML from a reply.
  bubble.textContent = text;
  chat.appendChild(bubble);
  scrollToNewest();
  return bubble;
}

addMessage("Assalam-o-Alaikum! I'm IqraGPT, your AI assistant. How can I help you today?", "model");

// Submitting the form works for both the send button and the Enter key.
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message || isSending || event.isComposing) return;

  isSending = true;
  sendButton.disabled = true;
  input.value = "";
  addMessage(message, "user");
  history.push({ role: "user", parts: [{ text: message }] });

  const typing = addMessage("IqraGPT is typing...", "model");
  typing.classList.add("typing");

  // Stop waiting after 30 seconds if the connection hangs.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    if (API_KEY === "PASTE_YOUR_GEMINI_KEY_HERE") {
      throw new Error("Add your Gemini API key before sending messages.");
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`);

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const reply = parts.map((part) => part.text || "").join("").trim();
    if (!reply) throw new Error("Gemini returned no text.");

    typing.remove();
    addMessage(reply, "model");
    history.push({ role: "model", parts: [{ text: reply }] });
  } catch (error) {
    // Remove the failed turn so the next request has valid conversation pairs.
    history.pop();
    typing.remove();
    addMessage("Sorry, I couldn't connect. Please try again.", "model");
    console.warn("IqraGPT:", error.message);
  } finally {
    clearTimeout(timeout);
    isSending = false;
    sendButton.disabled = false;
    scrollToNewest();
  }
});
