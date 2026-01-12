import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
    index: true,  
  },
  role: {
    type: String,
    enum: ["user", "assistant"], 
    required: true,
  },
  content: {
    type: String, 
    required: true,
  },
  hasImage: { 
    type: Boolean, 
    default: false 
  },
  isEdited: {
    type: Boolean,
    default: false
  }

}, { timestamps: true }); 

export default mongoose.model("Message", messageSchema);