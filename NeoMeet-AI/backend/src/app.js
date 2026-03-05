import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import aiRoutes from "./routes/ai.routes.js";

// Load environment variables
dotenv.config();

const app = express();

const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/ai", aiRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "NeoMeet API Server",
    status: "Running",
    endpoints: {
      users: "/api/v1/users",
      ai: "/api/v1/ai",
      home: "/home"
    }
  });
});

app.get("/home", (req, res) => {
  res.send("Hello World!");
});

const start = async () => {
  app.set("mongo_user");
  try {
    const connectionDb = await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB CONNECTED");
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    console.log("Starting server without database connection...");
  }
  
  server.listen(app.get("port"), () => {
    console.log(`LISTENING ON PORT ${app.get("port")}`);
  });
};

start();
