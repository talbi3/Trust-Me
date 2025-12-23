import ChatLog from '../data/ChatLog.js'; // Optional if you use DB

const processChatMessage = async (req, res) => {
    try {
        const { message, helpOption, userId, hasImage, isVoiceMessage } = req.body;

        // 1. (Optional) Save User Message to DB
        // await ChatLog.create({ userId, message, type: 'user', category: helpOption, hasImage });

        // 2. Determine Response Logic
        let reply = "I received your message.";
        let actions = [];

        if (hasImage) {
            reply = "I can see the image you uploaded. How can I help you regarding this picture?";
        } else if (isVoiceMessage) {
            reply = "I heard you loud and clear. Processing your voice request...";
        } else {
             // Basic Mock Logic based on category
            switch(helpOption) {
                case 'bullying':
                    reply = "I understand this is difficult. Are you safe right now?";
                    actions = ["Yes, I am safe", "No, I need help"];
                    break;
                case 'pictures':
                    reply = "Is this about a photo you sent, or one you received?";
                    break;
                case 'focus':
                    reply = "Let's work on getting you back on track. Do you need a timer technique or a blocked list?";
                    actions = ["Pomodoro Timer", "Block Apps"];
                    break;
                default:
                    reply = "I am here to listen.";
            }
        }

        // Simulate AI Delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // 3. (Optional) Save AI Response to DB
        // await ChatLog.create({ userId, message: reply, type: 'assistant', category: helpOption });

        res.status(200).json({ 
            response: reply, 
            actions: actions 
        });

    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export { processChatMessage };