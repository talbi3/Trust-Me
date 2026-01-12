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
  imageUrl: {
    type: String,
    default: null
  },
  hasImage: { 
    type: Boolean, 
    default: false 
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  // For AI detection analysis results (Pictures category)
  isAnalysisResult: {
    type: Boolean,
    default: false
  },
  safetyAnalysis: {
    type: mongoose.Schema.Types.Mixed,  // Stores the full analysis object
    default: null
  },
  // For YouTube analysis results
  isYoutubeAnalysis: {
    type: Boolean,
    default: false
  },
  youtubeAnalysis: {
    type: mongoose.Schema.Types.Mixed,  // Stores { verdict, reasons, videoMetadata }
    default: null
  }

}, { timestamps: true }); 

export default mongoose.model("Message", messageSchema);