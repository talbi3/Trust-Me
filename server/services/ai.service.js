import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/index.js"; 
import logger from "../utils/logger.js";  

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// 1. Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadSystemPrompt = async (currentTopic) => {
  try {
    // 2. Now we simply look for the file in __dirname (the same folder)
    const filePath = path.join(__dirname, 'systemPrompt.txt');
    
    let prompt = await fs.readFile(filePath, 'utf-8');
    
    const topicToInject = currentTopic || "General Safety";
    prompt = prompt.replace('{{TOPIC}}', topicToInject);

    return prompt;
  } catch (error) {
    logger.error(`Error reading system prompt from ${path.join(__dirname, 'systemPrompt.txt')}: ${error.message}`);
    return "You are a helpful and empathetic assistant for teenagers.";
  }
};

const generateAIResponse = async (chatHistory, topic) => {
  try {
    const systemInstruction = await loadSystemPrompt(topic);

    const messages = chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    messages.unshift({
      role: "system",
      content: systemInstruction,
    });

    const completion = await openai.chat.completions.create({
      model: config.openai.model || "gpt-3.5-turbo",
      messages,
      temperature: 0.7, 
    });

    return completion.choices[0].message.content;

  } catch (error) {
    logger.error(`OpenAI Service Error: ${error.message}`);
    throw error; 
  }
};

export { generateAIResponse };