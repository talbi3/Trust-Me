import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,  
  },
  title: {
    type: String,
    default: "New Chat",
  },
  category: {
    type: String,
    default: "general"
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true } 
});

chatSchema.virtual('messages', {
  ref: 'Message',       
  localField: '_id',    
  foreignField: 'chatId' 
});

export default mongoose.model("Chat", chatSchema);