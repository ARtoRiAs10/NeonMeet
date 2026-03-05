import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Select, FormControl,
  InputLabel, CircularProgress, IconButton, Tooltip
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import IcecreamIcon from "@mui/icons-material/Icecream";
import KeyIcon from "@mui/icons-material/Key";
import { generateMeetingAgenda, generateIcebreakers, getOpenRouterKey, saveOpenRouterKey } from "../utils/aiService";

const MEETING_TYPES = [
  { value: "general", label: "General Meeting" },
  { value: "standup", label: "Daily Standup" },
  { value: "brainstorm", label: "Brainstorming" },
  { value: "retrospective", label: "Retrospective" },
  { value: "planning", label: "Sprint Planning" },
  { value: "one-on-one", label: "1:1 Meeting" },
  { value: "client", label: "Client Meeting" },
];

export default function AgendaGenerator({ open, onClose, darkMode }) {
  const [tab, setTab] = useState("agenda"); // "agenda" | "icebreaker"
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(60);
  const [participants, setParticipants] = useState(4);
  const [meetingType, setMeetingType] = useState("general");
  const [teamSize, setTeamSize] = useState(5);
  const [iceContext, setIceContext] = useState("remote team meeting");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const bg = darkMode ? "#1a1a2e" : "#fff";
  const textColor = darkMode ? "#e0e0e0" : "#333";
  const borderColor = darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)";

  const handleGenerate = async () => {
    const apiKey = getOpenRouterKey();
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      if (tab === "agenda") {
        if (!topic.trim()) {
          setError("Please enter a meeting topic.");
          return;
        }
        const agenda = await generateMeetingAgenda({ topic, duration, participants, meetingType });
        setResult(agenda);
      } else {
        const icebreakers = await generateIcebreakers({ teamSize, context: iceContext });
        setResult(icebreakers);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      saveOpenRouterKey(apiKeyInput.trim());
      setShowKeyInput(false);
      setApiKeyInput("");
    }
  };

  const renderResult = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <p key={i} style={{ margin: "3px 0", lineHeight: 1.6, color: textColor }}
          dangerouslySetInnerHTML={{ __html: boldLine }} />
      );
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{
        style: {
          backgroundColor: bg,
          color: textColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
        }
      }}>
      <DialogTitle style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(135deg, rgba(1,140,203,0.15), rgba(123,47,190,0.15))",
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AutoAwesomeIcon style={{ color: "#018CCB" }} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>AI Meeting Tools</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Tooltip title={getOpenRouterKey() ? "API Key Set ✓" : "Set API Key"}>
            <IconButton size="small" onClick={() => setShowKeyInput(!showKeyInput)}
              style={{ color: getOpenRouterKey() ? "#4CAF50" : "#ff9800" }}>
              <KeyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} style={{ color: textColor }}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent style={{ padding: "20px 24px" }}>
        {/* API Key Input */}
        {showKeyInput && (
          <div style={{
            padding: 12,
            marginBottom: 16,
            background: "rgba(255,152,0,0.1)",
            border: "1px solid rgba(255,152,0,0.3)",
            borderRadius: 8,
          }}>
            <p style={{ fontSize: 12, color: "#ff9800", margin: "0 0 8px 0" }}>
              Enter your OpenRouter API key.{" "}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
                style={{ color: "#018CCB" }}>Get a free key →</a>
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <TextField
                size="small" fullWidth placeholder="sk-or-v1-..."
                value={apiKeyInput} type="password"
                onChange={e => setApiKeyInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveKey()}
                InputProps={{ style: { color: textColor } }}
              />
              <Button variant="contained" size="small" onClick={handleSaveKey}
                style={{ background: "#018CCB" }}>Save</Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { id: "agenda", label: "Agenda Generator", icon: "📋" },
            { id: "icebreaker", label: "Icebreakers", icon: "🎯" },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setResult(""); setError(""); }}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 10,
                border: tab === t.id ? "2px solid #018CCB" : `1px solid ${borderColor}`,
                background: tab === t.id ? "rgba(1,140,203,0.15)" : "transparent",
                color: tab === t.id ? "#018CCB" : textColor,
                cursor: "pointer",
                fontWeight: tab === t.id ? 600 : 400,
                fontSize: 13,
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Agenda Form */}
        {tab === "agenda" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <TextField
              label="Meeting Topic *"
              placeholder="e.g., Q3 Product Roadmap Review"
              fullWidth value={topic}
              onChange={e => setTopic(e.target.value)}
              size="small"
              InputProps={{ style: { color: textColor } }}
              InputLabelProps={{ style: { color: darkMode ? "#aaa" : undefined } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor } } }}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <TextField
                label="Duration (min)"
                type="number" value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                size="small" style={{ flex: 1 }}
                InputProps={{ style: { color: textColor }, inputProps: { min: 15, max: 480 } }}
                InputLabelProps={{ style: { color: darkMode ? "#aaa" : undefined } }}
                sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor } } }}
              />
              <TextField
                label="Participants"
                type="number" value={participants}
                onChange={e => setParticipants(Number(e.target.value))}
                size="small" style={{ flex: 1 }}
                InputProps={{ style: { color: textColor }, inputProps: { min: 1, max: 100 } }}
                InputLabelProps={{ style: { color: darkMode ? "#aaa" : undefined } }}
                sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor } } }}
              />
            </div>
            <FormControl size="small"
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor } } }}>
              <InputLabel style={{ color: darkMode ? "#aaa" : undefined }}>Meeting Type</InputLabel>
              <Select
                value={meetingType}
                onChange={e => setMeetingType(e.target.value)}
                label="Meeting Type"
                style={{ color: textColor }}
              >
                {MEETING_TYPES.map(t => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Icebreaker Form */}
        {tab === "icebreaker" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <TextField
              label="Team Size"
              type="number" value={teamSize}
              onChange={e => setTeamSize(Number(e.target.value))}
              size="small" fullWidth
              InputProps={{ style: { color: textColor }, inputProps: { min: 2, max: 50 } }}
              InputLabelProps={{ style: { color: darkMode ? "#aaa" : undefined } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor } } }}
            />
            <TextField
              label="Meeting Context"
              placeholder="e.g., remote team meeting, kickoff call"
              fullWidth value={iceContext}
              onChange={e => setIceContext(e.target.value)}
              size="small"
              InputProps={{ style: { color: textColor } }}
              InputLabelProps={{ style: { color: darkMode ? "#aaa" : undefined } }}
              sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor } } }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ marginTop: 12, padding: 10, background: "rgba(244,67,54,0.1)",
            border: "1px solid rgba(244,67,54,0.3)", borderRadius: 8, color: "#f44336", fontSize: 13 }}>
            ❌ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{
            marginTop: 16,
            padding: 16,
            background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(1,140,203,0.05)",
            border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(1,140,203,0.2)"}`,
            borderRadius: 10,
            maxHeight: 300,
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#018CCB", fontWeight: 600 }}>
                ✨ AI Generated Result
              </span>
              <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                <IconButton size="small" onClick={handleCopy} style={{ color: "#018CCB" }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
            <div style={{ fontSize: 13 }}>{renderResult(result)}</div>
          </div>
        )}
      </DialogContent>

      <DialogActions style={{ padding: "12px 24px", borderTop: `1px solid ${borderColor}` }}>
        <Button onClick={onClose} style={{ color: darkMode ? "#aaa" : "#666" }}>
          Close
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
          style={{
            background: "linear-gradient(135deg, #018CCB, #7B2FBE)",
            color: "#fff",
            borderRadius: 8,
          }}
        >
          {loading ? "Generating..." : tab === "agenda" ? "Generate Agenda" : "Generate Icebreakers"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
