import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up Express JSON parsing with a generous size limit
app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. API features will be unavailable.");
}

// 1. API: Generate Project Blueprint
app.post("/api/blueprint/generate", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API Client is not configured. Please set the GEMINI_API_KEY under Settings > Secrets.",
    });
  }

  const { projectIdea, agentPersona } = req.body;

  if (!projectIdea) {
    return res.status(400).json({ error: "projectIdea is required" });
  }

  const prompt = `Create a highly comprehensive and structured project blueprint based on the following idea:
"${projectIdea}"

You are acting as an elite expert agent: ${agentPersona || "Software Architect"}.
Provide professional insights, specific recommendations, realistic milestones, and highly actionable tasks.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are a world-class project planning consultant. Your goal is to dissect project ideas into highly detailed, feasible, and professional blueprints. Focus on providing realistic timelines, specific technical details, concrete action items, and actionable objectives. Output must be perfectly formatted JSON adhering strictly to the response schema. Do not include mock values like "Lorem Ipsum". Be extremely concrete and contextual to the user description.`,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: "A highly professional, punchy, non-generic name for the project.",
            },
            elevatorPitch: {
              type: Type.STRING,
              description: "A compelling 2-sentence value proposition of the project.",
            },
            objectives: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3-4 structural, core objectives for this project.",
            },
            suggestedTechStack: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "Category (e.g. Frontend, DB, Auth, Styling)" },
                  tech: { type: Type.STRING, description: "Specific tool/framework name" },
                  reason: { type: Type.STRING, description: "Detailed rationale of why this is perfect for this specific project" },
                },
                required: ["category", "tech", "reason"],
              },
            },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique short module slug, e.g. 'auth-system'" },
                  title: { type: Type.STRING, description: "Descriptive name of the module" },
                  description: { type: Type.STRING, description: "Detailed summary of what this module achieves" },
                  priority: { type: Type.STRING, description: "Priority level: High, Medium, or Low" },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of 4-6 highly specific, actionable, single-responsibility technical tasks for this module",
                  },
                },
                required: ["id", "title", "description", "priority", "tasks"],
              },
            },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "e.g. 'phase-1'" },
                  phaseName: { type: Type.STRING, description: "Descriptive phase title" },
                  duration: { type: Type.STRING, description: "Estimated time frame e.g. 'Week 1-2'" },
                  deliverables: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Explicit, testable high-level deliverables for this phase",
                  },
                },
                required: ["id", "phaseName", "duration", "deliverables"],
              },
            },
          },
          required: ["projectName", "elevatorPitch", "objectives", "suggestedTechStack", "modules", "milestones"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate project blueprint." });
  }
});

// 2. API: Expert Advisor Chat
app.post("/api/blueprint/chat", async (req, res) => {
  if (!ai) {
    return res.status(500).json({
      error: "Gemini API Client is not configured. Please set the GEMINI_API_KEY under Settings > Secrets.",
    });
  }

  const { message, history, contextBlueprint, agentDetails } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  // Build the persona context
  const agentTitle = agentDetails?.name || "Sophia Vance (Lead Architect)";
  const agentRoleDesc = agentDetails?.roleDescription || "Focuses on clean API contracts, systems alignment and efficient schemas.";
  const projContext = contextBlueprint
    ? `\n\nCURRENT PROJECT BLUEPRINT CONTEXT:\n${JSON.stringify(contextBlueprint, null, 2)}`
    : "";

  const systemInstruction = `You are ${agentTitle}, ${agentRoleDesc}.
You are currently advising the user face-to-face inside their interactive project planning workspace.
Generate professional, constructive, and highly tailored counsel matching your expert persona. 
Use markdown formatting where helpful. Be direct, clever, helpful, and keep responses engaging but concise (under 200 words). Do not use placeholders or generic talk. Reference their project details directly.`;

  try {
    // Format history for the chat setup
    const chatContents = (history || []).map((chatMsg: any) => ({
      role: chatMsg.isUser ? "user" : "model",
      parts: [{ text: chatMsg.text }],
    }));

    // Append the current message
    chatContents.push({
      role: "user",
      parts: [{ text: `${message}${projContext}` }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const responseText = response.text || "I was unable to formulate a response. Let us try that query again.";
    return res.json({ text: responseText });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return res.status(500).json({ error: error.message || "Advisor server communication failure." });
  }
});

// Integration with Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Project Workspace] Server launched and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
