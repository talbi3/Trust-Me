import mongoose from "mongoose";
import dotenv from "dotenv";
import ChatLog from "../data/ChatLog.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const userId = "demo-user";
  const base = new Date();

  function dayOffset(n) {
    const d = new Date(base);
    d.setDate(d.getDate() - n);
    return d;
  }

  await ChatLog.insertMany([
    {
      userId,
      message: "Hello from yesterday",
      type: "user",
      category: "general",
      timestamp: dayOffset(1),
    },
    {
      userId,
      message: "Assistant reply yesterday",
      type: "assistant",
      category: "general",
      timestamp: dayOffset(1),
    },
    {
      userId,
      message: "Today message 1",
      type: "user",
      category: "mars",
      timestamp: dayOffset(0),
    },
    {
      userId,
      message: "Today message 2",
      type: "assistant",
      category: "mars",
      timestamp: dayOffset(0),
    },
  ]);

  console.log("Seed done");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
