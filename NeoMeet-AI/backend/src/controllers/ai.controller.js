import httpStatus from "http-status";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct:free"; // Free tier model

/**
 * Helper: Call OpenRouter API
 */
async function callOpenRouter(messages, apiKey) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
      "X-Title": "NeoMeet AI Assistant",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      max_tokens: 800,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}

/**
 * POST /api/v1/ai/chat
 * AI Meeting Assistant — answers meeting-related questions
 */
export const aiChat = async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  const apiKey = req.headers["x-openrouter-key"] || process.env.OPENROUTER_API_KEY;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }
  if (!apiKey) {
    return res.status(400).json({ message: "OpenRouter API key is required. Pass it in the x-openrouter-key header or set OPENROUTER_API_KEY env var." });
  }

  try {
    const systemPrompt = `You are NeoMeet AI Assistant, a helpful assistant integrated into a video conferencing app called NeoMeet. 
You help users with:
- Meeting facilitation tips
- Generating quick agendas
- Answering questions during meetings
- Summarizing discussions
- Suggesting icebreakers
- Providing productivity advice for remote teams
Keep responses concise and practical. Format responses clearly.`;

    const messages = [
      { role: "system", content: systemPrompt },
      // Include past conversation (max last 6 messages for context)
      ...conversationHistory.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const reply = await callOpenRouter(messages, apiKey);
    return res.status(httpStatus.OK).json({ reply });
  } catch (error) {
    console.error("AI Chat error:", error.message);
    return res.status(500).json({ message: `AI service error: ${error.message}` });
  }
};

/**
 * POST /api/v1/ai/summarize
 * Summarize meeting chat messages
 */
export const summarizeChat = async (req, res) => {
  const { messages: chatMessages, meetingTitle = "Meeting" } = req.body;
  const apiKey = req.headers["x-openrouter-key"] || process.env.OPENROUTER_API_KEY;

  if (!chatMessages || !Array.isArray(chatMessages) || chatMessages.length === 0) {
    return res.status(400).json({ message: "Chat messages array is required" });
  }
  if (!apiKey) {
    return res.status(400).json({ message: "OpenRouter API key is required." });
  }

  try {
    // Format chat messages for the prompt
    const chatText = chatMessages
      .map(m => `${m.sender}: ${m.data}`)
      .join("\n");

    const prompt = `Please provide a concise and structured summary of the following meeting chat from "${meetingTitle}":

CHAT MESSAGES:
${chatText}

Provide the summary in this format:
1. **Key Topics Discussed** - bullet points of main topics
2. **Important Decisions/Action Items** - any decisions made or actions mentioned
3. **Overall Tone** - brief note on meeting atmosphere
4. **Next Steps** - if any were mentioned

Keep it brief and professional.`;

    const messages = [
      { role: "user", content: prompt },
    ];

    const summary = await callOpenRouter(messages, apiKey);
    return res.status(httpStatus.OK).json({ summary });
  } catch (error) {
    console.error("Summary error:", error.message);
    return res.status(500).json({ message: `AI service error: ${error.message}` });
  }
};

/**
 * POST /api/v1/ai/agenda
 * Generate a meeting agenda from a topic
 */
export const generateAgenda = async (req, res) => {
  const { topic, duration = 60, participants = 4, meetingType = "general" } = req.body;
  const apiKey = req.headers["x-openrouter-key"] || process.env.OPENROUTER_API_KEY;

  if (!topic) {
    return res.status(400).json({ message: "Meeting topic is required" });
  }
  if (!apiKey) {
    return res.status(400).json({ message: "OpenRouter API key is required." });
  }

  try {
    const prompt = `Create a detailed and practical meeting agenda for the following:

Topic: ${topic}
Duration: ${duration} minutes
Number of participants: ${participants}
Meeting type: ${meetingType}

Format the agenda with:
1. **Meeting Title** - catchy and clear
2. **Objective** - 1-2 sentences
3. **Agenda Items** - with time allocations (use format: [X min] Item Name - brief description)
4. **Preparation Required** - what attendees should prepare
5. **Expected Outcomes** - 2-3 bullet points

Make it practical and time-efficient.`;

    const messages = [
      { role: "user", content: prompt },
    ];

    const agenda = await callOpenRouter(messages, apiKey);
    return res.status(httpStatus.OK).json({ agenda });
  } catch (error) {
    console.error("Agenda generation error:", error.message);
    return res.status(500).json({ message: `AI service error: ${error.message}` });
  }
};

/**
 * POST /api/v1/ai/icebreaker
 * Generate icebreaker questions for a meeting
 */
export const generateIcebreaker = async (req, res) => {
  const { teamSize = 5, context = "remote team meeting" } = req.body;
  const apiKey = req.headers["x-openrouter-key"] || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ message: "OpenRouter API key is required." });
  }

  try {
    const prompt = `Generate 5 fun and engaging icebreaker questions or activities for a ${context} with ${teamSize} people. 
Mix light-hearted and professional questions. Make them inclusive and appropriate for a work setting.
Format as a numbered list with a brief note on why each works well.`;

    const messages = [
      { role: "user", content: prompt },
    ];

    const icebreakers = await callOpenRouter(messages, apiKey);
    return res.status(httpStatus.OK).json({ icebreakers });
  } catch (error) {
    console.error("Icebreaker error:", error.message);
    return res.status(500).json({ message: `AI service error: ${error.message}` });
  }
};
