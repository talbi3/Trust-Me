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
   
};

export default config;