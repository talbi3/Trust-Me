export const FALLBACK_USER_ID = "Child-User";

export const FEATURES_BY_CATEGORY = {
  // Topic: Safe Photo Sharing & AI-Protected Images
  Pictures: [
    { 
      key: "safe_share", 
      label: "📸 Is this photo safe?", 
      message: "I want to share a photo online. Can you check if it's safe and protect it for me?" 
    },
    { 
      key: "ai_editing", 
      label: "🛡 Protect my picture", 
      message: "Can you turn my picture into a protected version so no one can change it with AI?" 
    },
    { 
      key: "stranger_photo_request", 
      label: "⚠️ Someone asked for a photo", 
      message: "Someone online asked me to send them a picture. Is it safe to do that?" 
    }
  ],

  // Topic: Cyberbullying & Harmful Messages
  Bullying: [
    { 
      key: "hurtful_message", 
      label: "😢 Someone was mean to me", 
      message: "I got a message that made me feel bad. What should I do?" 
    },
    { 
      key: "report_bullying", 
      label: "🚩 I want to report bullying", 
      message: "How do I report a message that was hurtful or scary?" 
    },
    { 
      key: "unsafe_chat", 
      label: "🛑 I feel unsafe in a chat", 
      message: "Someone keeps sending me messages that worry me. Can you help me stay safe?" 
    }
  ],

  // Topic: Focus, Screen Time & Healthy Habits
  Focus: [
    { 
      key: "screen_time", 
      label: "⏳ I'm on my phone too much", 
      message: "I think I've been using social media for too long today. Can you help me take a break?" 
    },
    { 
      key: "focus_mode", 
      label: "🎯 Turn on Focus Mode", 
      message: "I need to focus on studying. Can you help me block distractions for a while?" 
    },
    { 
      key: "distracted", 
      label: "📚 I'm too distracted", 
      message: "I'm trying to do homework, but I keep checking apps. How do I stay focused?" 
    }
  ]

};
