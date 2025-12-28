import mongoose from 'mongoose';

const ChatLogSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',       
        required: true,
        index: true       
    },

    message: { type: String, required: true }, 

    type: { 
        type: String, 
        enum: ['user', 'assistant'], 
        required: true 
    },

    category: { type: String, default: 'general' }, 
    hasImage: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
}, 
{ 
    timestamps: true 
});

export default mongoose.model('ChatLog', ChatLogSchema);