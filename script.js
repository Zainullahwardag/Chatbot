// OpenRouter API key — get your own at https://openrouter.ai/keys
const API_KEY = "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";
const MODEL = "openrouter/free";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Chat history — user's messages and the assistant's replies.
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
  // role is "user" or "model" — CSS colors them differently
  bubble.className = `message ${role}`;
  bubble.textContent = text;
  chat.appendChild(bubble);
  scrollToNewest();
  return bubble;
}

addMessage("Assalam-o-Alaikum! I'm IqraGPT, your AI assistant. How can I help you today?", "model");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message || isSending || event.isComposing) return;

  isSending = true;
  sendButton.disabled = true;
  input.value = "";
  addMessage(message, "user");
  history.push({ role: "user", content: message });

  const typing = addMessage("IqraGPT is typing...", "model");
  typing.classList.add("typing");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        // Optional but recommended by OpenRouter:
        "HTTP-Referer": "https://zainullahwardag.github.io/Chatbot/",
        "X-Title": "IqraGPT"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: history
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", errorData);
      throw new Error(errorData.error?.message || `Request failed: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("No reply received.");

    typing.remove();
    addMessage(reply, "model");
    history.push({ role: "assistant", content: reply });
  } catch (error) {
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