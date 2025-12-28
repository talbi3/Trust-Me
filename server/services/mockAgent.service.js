
export const generateMockResponse = async (helpOption, hasImage, isVoiceMessage) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  let response = "I received your message.";
  let actions = [];

  if (hasImage) {
    return { 
      response: "I can see the image you uploaded. How can I help you regarding this picture?", 
      actions: [] 
    };
  } 
  
  if (isVoiceMessage) {
    return { 
      response: "I heard you loud and clear. Processing your voice request...", 
      actions: [] 
    };
  }

 
  switch (helpOption) {
    case 'bullying':
      response = "I understand this is difficult. Are you safe right now?";
      actions = ["Yes, I am safe", "No, I need help"];
      break;

    case 'evidence': 
      response = "Is this about a photo you sent, or one you received?";
      break;

    case 'mute': 
      response = "Let's work on getting you back on track. Do you need a timer technique or a blocked list?";
      actions = ["Pomodoro Timer", "Block Apps"];
      break;

    default:
      response = "I am here to listen. Tell me more.";
  }

  return { response, actions };
};