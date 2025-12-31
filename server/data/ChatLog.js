import mongoose from 'mongoose';

const ChatLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    message: { type: String },
    type: { type: String, enum: ['user', 'assistant'], required: true },
    category: { type: String },
    hasImage: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('ChatLog', ChatLogSchema);