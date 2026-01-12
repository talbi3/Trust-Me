import dotenv from "dotenv";
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || "5000"),
  
  db: {
    uri: process.env.MONGODB_URI, 
    name: process.env.MONGODB_DB_NAME || "trust-me",
  },
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  },

  debug: process.env.APP_DEBUG === "true",
  logLevel: process.env.LOG_LEVEL || "debug",

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    max_tokens: 400,
  },

  googleAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },


};

 

export default config;


 