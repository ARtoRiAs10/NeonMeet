import React, { useState, useRef, useEffect } from "react";
import { Button, TextField, CircularProgress, IconButton, Tooltip } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SummarizeIcon from "@mui/icons-material/Summarize";
import KeyIcon from "@mui/icons-material/Key";
import { sendAIMessage, summarizeMeetingChat, getOpenRouterKey, saveOpenRouterKey } from "../utils/aiService";

const QUICK_PROMPTS = [
  "Suggest 3 icebreaker questions",
  "How to run an effective standup?",
  "Tips for remote meeting engagement",
  "Help me write a meeting follow-up email",
];

export default function AIAssistantPanel({ chatMessages = [], onClose, username = "You" }) {
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm **NeoMeet AI Assistant**. I can help with meeting tips, generate agendas, suggest icebreakers, or summarize your chat. What can I do for you?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(!getOpenRouterKey());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const handleSend = async (messageText) => {
    const msg = messageText || input.trim();
    if (!msg || loading) return;

    const apiKey = getOpenRouterKey();
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setInput("");
    setError("");
    const userMsg = { role: "user", content: msg };
    const newConversation = [...conversation, userMsg];
    setConversation(newConversation);
    setLoading(true);

    try {
      const reply = await sendAIMessage(msg, newConversation);
      setConversation(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message);
      setConversation(prev => [...prev, {
        role: "assistant",
        content: `❌ Error: ${err.message}. Please check your API key.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!chatMessages.length) {
      setConversation(prev => [...prev, {
        role: "assistant",
        content: "No chat messages to summarize yet. Start chatting in the meeting first!",
      }]);
      return;
    }

    const apiKey = getOpenRouterKey();
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setSummaryLoading(true);
    setError("");
    setConversation(prev => [...prev, {
      role: "user",
      content: "📝 Summarize the meeting chat so far",
    }]);

    try {
      const summary = await summarizeMeetingChat(chatMessages, "NeoMeet Session");
      setConversation(prev => [...prev, { role: "assistant", content: summary }]);
    } catch (err) {
      setConversation(prev => [...prev, {
        role: "assistant",
        content: `❌ Error: ${err.message}`,
      }]);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      saveOpenRouterKey(apiKeyInput.trim());
      setShowApiKeyInput(false);
      setApiKeyInput("");
      setConversation(prev => [...prev, {
        role: "assistant",
        content: "✅ API key saved! I'm ready to help you now. What would you like to know?",
      }]);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      backgroundColor: "#0f0f1a",
      color: "#e0e0e0",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "linear-gradient(135deg, #018CCB22, #7B2FBE22)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AutoAwesomeIcon style={{ color: "#018CCB", fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>AI Assistant</span>
          <span style={{
            fontSize: 10,
            padding: "2px 6px",
            borderRadius: 8,
            background: "linear-gradient(135deg, #018CCB, #7B2FBE)",
            color: "#fff",
          }}>BETA</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Tooltip title="Set API Key">
            <IconButton size="small" onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              style={{ color: getOpenRouterKey() ? "#4CAF50" : "#ff9800" }}>
              <KeyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} style={{ color: "#aaa" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <div style={{
          padding: "12px",
          background: "rgba(255,152,0,0.1)",
          borderBottom: "1px solid rgba(255,152,0,0.3)",
        }}>
          <p style={{ fontSize: 12, color: "#ff9800", margin: "0 0 8px 0" }}>
            🔑 Enter your OpenRouter API key to enable AI features.{" "}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
              style={{ color: "#018CCB" }}>Get a free key →</a>
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <TextField
              size="small"
              placeholder="sk-or-v1-..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSaveKey()}
              type="password"
              fullWidth
              InputProps={{ style: { color: "#fff", fontSize: 12 } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "rgba(255,152,0,0.4)" },
                }
              }}
            />
            <Button variant="contained" size="small" onClick={handleSaveKey}
              style={{ background: "#018CCB", minWidth: 60 }}>
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      <div style={{
        display: "flex",
        gap: 6,
        padding: "8px 12px",
        flexWrap: "wrap",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            style={{
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 12,
              border: "1px solid rgba(1,140,203,0.4)",
              background: "rgba(1,140,203,0.1)",
              color: "#018CCB",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.target.style.background = "rgba(1,140,203,0.25)"}
            onMouseLeave={e => e.target.style.background = "rgba(1,140,203,0.1)"}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Conversation */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        {conversation.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #018CCB, #7B2FBE)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
                flexShrink: 0,
                fontSize: 12,
              }}>
                ✨
              </div>
            )}
            <div style={{
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #018CCB, #0179b0)"
                : "rgba(255,255,255,0.07)",
              color: "#fff",
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              {msg.role === "assistant" ? (
                <div className="ai-markdown" style={{ fontSize: 13 }}>
                  {/* Render markdown-like bold text */}
                  {msg.content.split("\n").map((line, li) => {
                    const boldLine = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
                    return (
                      <p key={li} style={{ margin: "2px 0" }}
                        dangerouslySetInnerHTML={{ __html: boldLine }} />
                    );
                  })}
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {(loading || summaryLoading) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: "linear-gradient(135deg, #018CCB, #7B2FBE)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✨</div>
            <div style={{
              padding: "10px 14px",
              borderRadius: "16px 16px 16px 4px",
              background: "rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <CircularProgress size={14} style={{ color: "#018CCB" }} />
              <span style={{ fontSize: 13, color: "#aaa" }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Summarize Chat Button */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Button
          onClick={handleSummarize}
          disabled={summaryLoading || loading}
          fullWidth
          size="small"
          startIcon={<SummarizeIcon fontSize="small" />}
          style={{
            background: "rgba(123,47,190,0.2)",
            color: "#b06af5",
            border: "1px solid rgba(123,47,190,0.4)",
            fontSize: 12,
            textTransform: "none",
          }}
        >
          {chatMessages.length > 0
            ? `Summarize Chat (${chatMessages.length} messages)`
            : "Summarize Chat"}
        </Button>
      </div>

      {/* Input */}
      <div style={{
        display: "flex",
        gap: 8,
        padding: "10px 12px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Ask AI anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading}
          InputProps={{ style: { color: "#fff", fontSize: 13 } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
              "&:hover fieldset": { borderColor: "#018CCB" },
              "&.Mui-focused fieldset": { borderColor: "#018CCB" },
            },
          }}
        />
        <IconButton
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          size="small"
          style={{
            background: input.trim() ? "#018CCB" : "rgba(255,255,255,0.1)",
            color: "#fff",
            borderRadius: 8,
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}
