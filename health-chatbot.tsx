"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Send, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { sendMessageToBot } from "@/lib/api"
import type { ChatResponse } from "@/lib/api"
import ChatDisplay from "@/components/ChatDisplay"

// Define message type for better TypeScript support
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function HealthChatbot() {
  const [inputText, setInputText] = useState("")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | undefined>(undefined)

  const recommendedQuestions = [
    "간암 진단 받고 수술 날짜 잡았는데, 당분간 어떤 음식은 꼭 피해야 하나요?",
    "당뇨병 환자인데 혈당 관리를 위해 어떤 운동이 좋을까요?",
    "고혈압 약을 복용 중인데 함께 먹으면 안 되는 음식이 있나요?",
    "위암 수술 후 회복기간 동안 주의해야 할 점들이 궁금해요",
    "갑상선 기능 저하증 진단받았는데 일상생활에서 어떤 점을 조심해야 하나요?",
  ]

  // Show welcome message on initial load
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: '안녕하세요! 건강에 대한 어떤 고민이든 자유롭게 말씀해 주세요.',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % recommendedQuestions.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + recommendedQuestions.length) % recommendedQuestions.length)
  }

  const handleQuestionClick = (question: string) => {
    setInputText(question)
  }

  /**
   * Handles sending a message to the bot
   * @param {string} messageText - The text message to send
   */
  const handleSendMessage = async (messageText: string) => {
    // Don't send empty messages
    if (!messageText.trim()) return;

    // Create user message object
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message to chat immediately
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input field
    setInputText('');
    
    // Set loading state
    setIsLoading(true);

    try {
      // Send message to API and get bot response
      const response = await sendMessageToBot(messageText, threadId);
      
      // Update thread ID if it's a new conversation
      if (response.threadId && !threadId) {
        setThreadId(response.threadId);
      }
      
      // Create bot message object using the output from OpenAI Assistant
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.output,
        isUser: false,
        timestamp: new Date(),
      };

      // Add bot message to chat
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      // Handle error by showing error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '죄송합니다. 메시지 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Clear loading state
      setIsLoading(false);
    }
  };

  /**
   * Handles form submission (Enter key or button click)
   */
  const handleSubmit = () => {
    handleSendMessage(inputText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Wave Background */}
      <div className="absolute inset-0 opacity-5">
        <svg viewBox="0 0 1200 800" className="w-full h-full">
          <path
            d="M0,400 C300,300 600,500 900,400 C1050,350 1150,450 1200,400 L1200,800 L0,800 Z"
            fill="currentColor"
            className="text-purple-600"
          />
          <path
            d="M0,500 C300,400 600,600 900,500 C1050,450 1150,550 1200,500 L1200,800 L0,800 Z"
            fill="currentColor"
            className="text-green-500"
          />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          홈으로
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content - Chat Interface */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8">
        <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
          {/* Chat Display - Takes most of the vertical space */}
          <div className="flex-1 overflow-hidden">
            <ChatDisplay messages={messages} isLoading={isLoading} />
          </div>

          {/* Fixed Chat Input at Bottom */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 animate-slide-up">
            <div className="relative max-w-2xl mx-auto">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="건강 고민을 자유롭게 말씀해 주세요..."
                className="pl-4 pr-12 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-purple-400 shadow-sm transition-all duration-200"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
                disabled={!inputText.trim() || isLoading}
                onClick={handleSubmit}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Small Recommended Questions Bar at Bottom */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 animate-slide-up-delayed">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">추천 질문:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:bg-gray-200 transition-colors"
                    onClick={prevSlide}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <span className="text-xs text-gray-500 min-w-[200px] text-center">
                    {recommendedQuestions[currentSlide]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full hover:bg-gray-200 transition-colors"
                    onClick={nextSlide}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-purple-600 hover:text-purple-700 transition-colors"
                  onClick={() => handleQuestionClick(recommendedQuestions[currentSlide])}
                >
                  사용하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
