import { Router } from "express";
import {
  aiChat,
  summarizeChat,
  generateAgenda,
  generateIcebreaker,
} from "../controllers/ai.controller.js";

const router = Router();

// AI Meeting Assistant - chat with AI
router.route("/chat").post(aiChat);

// Summarize meeting chat messages
router.route("/summarize").post(summarizeChat);

// Generate meeting agenda from topic
router.route("/agenda").post(generateAgenda);

// Generate icebreaker questions
router.route("/icebreaker").post(generateIcebreaker);

export default router;
