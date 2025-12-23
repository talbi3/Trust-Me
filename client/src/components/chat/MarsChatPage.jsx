import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import CategorySelector from '../components/chat/CategorySelector';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { sendMessageToMars } from '../services/chatService';

const USER_ID = 'Perseverance-34';

const MarsChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Callback for when voice recording finishes
  const handleVoiceResult = (transcript) => {
    // Only send if we have a valid transcript
    if (transcript) {
        handleSendMessage(transcript);
    }
  };

  const { isListening, toggleListening } = useSpeechRecognition(handleVoiceResult);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setMessages([{
      id: Date.now(),
      type: 'assistant',
      content: `Hello! I'm here to help you with ${category.label.toLowerCase()}. How can I assist you today?`,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async (overrideText = null) => {
    const textToSend = overrideText || inputValue;
    
    // Validation
    if ((!textToSend.trim() && !imagePreview) || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: textToSend,
      image: imagePreview,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setImagePreview(null);
    setIsLoading(true);

    try {
      const data = await sendMessageToMars({
        message: textToSend,
        helpOption: selectedCategory?.id,
        userId: USER_ID,
        conversationHistory: messages, // Send context
        hasImage: !!imagePreview,
        isVoiceMessage: !!overrideText
      });

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.response || 'Message received!',
        actions: data.actions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'm having trouble connecting to the network. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setMessages([]);
    setInputValue('');
    setImagePreview(null);
  };

  if (!selectedCategory) {
    return <CategorySelector onSelectCategory={handleCategorySelect} userId={USER_ID} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-xl">{selectedCategory.icon}</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{selectedCategory.label}</h1>
              <p className="text-sm text-gray-500">Support Assistant</p>
            </div>
          </div>
          <button onClick={handleReset} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all">
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Change Topic</span>
          </button>
        </div>
      </div>

      <MessageList messages={messages} isLoading={isLoading} />

      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={() => handleSendMessage()}
        isLoading={isLoading}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        isListening={isListening}
        onToggleListening={toggleListening}
      />
    </div>
  );
};

export default MarsChatPage;