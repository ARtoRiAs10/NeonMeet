const server = process.env.REACT_APP_API_URL || "https://neomeet.onrender.com";

/**
 * Get the OpenRouter API key from env or localStorage
 */
export function getOpenRouterKey() {
  return (
    process.env.REACT_APP_OPENROUTER_API_KEY ||
    localStorage.getItem("openrouter_api_key") ||
    ""
  );
}

/**
 * Save OpenRouter API key to localStorage
 */
export function saveOpenRouterKey(key) {
  localStorage.setItem("openrouter_api_key", key);
}

/**
 * Call the backend AI chat endpoint
 */
export async function sendAIMessage(message, conversationHistory = []) {
  const apiKey = getOpenRouterKey();
  const response = await fetch(`${server}/api/v1/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-openrouter-key": apiKey,
    },
    body: JSON.stringify({ message, conversationHistory }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "AI request failed");
  return data.reply;
}

/**
 * Summarize meeting chat messages
 */
export async function summarizeMeetingChat(messages, meetingTitle = "Meeting") {
  const apiKey = getOpenRouterKey();
  const response = await fetch(`${server}/api/v1/ai/summarize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-openrouter-key": apiKey,
    },
    body: JSON.stringify({ messages, meetingTitle }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Summarization failed");
  return data.summary;
}

/**
 * Generate a meeting agenda
 */
export async function generateMeetingAgenda({ topic, duration, participants, meetingType }) {
  const apiKey = getOpenRouterKey();
  const response = await fetch(`${server}/api/v1/ai/agenda`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-openrouter-key": apiKey,
    },
    body: JSON.stringify({ topic, duration, participants, meetingType }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Agenda generation failed");
  return data.agenda;
}

/**
 * Generate icebreaker questions
 */
export async function generateIcebreakers({ teamSize, context }) {
  const apiKey = getOpenRouterKey();
  const response = await fetch(`${server}/api/v1/ai/icebreaker`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-openrouter-key": apiKey,
    },
    body: JSON.stringify({ teamSize, context }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Icebreaker generation failed");
  return data.icebreakers;
}
