import OpenAI from "openai";
import fsPromises from "fs/promises"; 
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
    const filePath = path.join(__dirname, 'systemPrompt.txt');
    let prompt = await fsPromises.readFile(filePath, 'utf-8');
    const topicToInject = currentTopic || "General Safety";
    prompt = prompt.replace('{{TOPIC}}', topicToInject);
    return prompt;
  } catch (error) {
    logger.error(`Error reading system prompt: ${error.message}`);
    return "You are a helpful and empathetic assistant for teenagers.";
  }
};

/**
 * Generates the main response for the chat
 */
const generateAIResponse = async (chatHistory, topic, userMetadata) => {
  try {
    const systemInstruction = await loadSystemPrompt(topic);

    const metadataBlock = userMetadata
      ? `\n\nUser metadata (for personalization; do not invent missing fields):\n${JSON.stringify(userMetadata)}`
      : "";

    const messages = chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    messages.unshift({
      role: "system",
      content: systemInstruction + metadataBlock,
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

/**
 * Generates a short, creative title for the chat
 */
const generateChatTitle = async (userMessage, topic) => {
  try {
    const systemPrompt = `
      You are a creative copywriter. 
      Generate a short, engaging, and relevant title (maximum 5 words) for a chat conversation.
      The chat topic is: "${topic}".
      Based on the user's first message, create a title that summarizes the intent.
      Return ONLY the title text. Do not use quotation marks.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 15, 
    });

    let title = completion.choices[0].message.content.trim();
    title = title.replace(/^["']|["']$/g, '');

    return title;

  } catch (error) {
    logger.error(`Error generating chat title: ${error.message}`);
    return "New Conversation"; 
  }
};


export { 
    generateAIResponse, 
    generateChatTitle,
};