"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, User, Send, Search, FileText, Utensils, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { sendMessageToBot } from "@/lib/api"
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
  const [hasStartedChat, setHasStartedChat] = useState(false)

  const recommendedQuestions = [
    "간암 진단 받고 수술 날짜 잡았는데, 당분간 어떤 음식은 꼭 피해야 하나요?",
    "당뇨병 환자인데 혈당 관리를 위해 어떤 운동이 좋을까요?",
    "고혈압 약을 복용 중인데 함께 먹으면 안 되는 음식이 있나요?",
    "위암 수술 후 회복기간 동안 주의해야 할 점들이 궁금해요",
    "갑상선 기능 저하증 진단받았는데 일상생활에서 어떤 점을 조심해야 하나요?",
  ]

  const ctaButtons = [
    {
      icon: Search,
      title: "실제 환자 사례 찾기",
      description: "공신력 있는 질문-답변 DB 탐색",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    },
    {
      icon: FileText,
      title: "검사 결과지 해석",
      description: "키워드 기반 간단한 건강검진 해석",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
    },
    {
      icon: Utensils,
      title: "식단 분석",
      description: "입력한 식단의 건강성 평가",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    },
  ]

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

    // Mark that chat has started
    setHasStartedChat(true);

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
      const response = await sendMessageToBot(messageText);
      
      // Create bot message object
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: (response as any).reply || '죄송합니다. 요청을 처리할 수 없습니다.',
        isUser: false,
        timestamp: new Date(),
      };

      // Add bot message to chat
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
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

  /**
   * Resets the chat and returns to the original layout
   */
  const handleGoHome = () => {
    setHasStartedChat(false);
    setMessages([]);
    setInputText('');
    setIsLoading(false);
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
        {hasStartedChat ? (
          // Home button when chat is active
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full text-gray-600 hover:text-purple-600"
            onClick={handleGoHome}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            홈으로
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8">
        {!hasStartedChat ? (
          // Original layout when chat hasn't started
          <>
            {/* Title */}
            <div className="text-center mb-12 mt-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                지금 가장 걱정되는
                <br />
                건강 고민이 뭐예요?
              </h1>
              <p className="text-gray-600 text-lg">공신력 있는 기관의 정보를 바탕으로 도움을 드릴게요</p>
            </div>

            {/* Chat Input */}
            <div className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="건강 고민을 자유롭게 말씀해 주세요..."
                  className="pl-4 pr-12 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-purple-400 shadow-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-purple-600 hover:bg-purple-700"
                  disabled={!inputText.trim()}
                  onClick={handleSubmit}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Recommended Questions */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">다른 환자들은 이런 질문을 했어요</h2>
              <div className="relative max-w-3xl mx-auto">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {recommendedQuestions.map((question, index) => (
                      <div key={index} className="w-full flex-shrink-0 px-2">
                        <Card
                          className="cursor-pointer hover:shadow-md transition-shadow border-2 border-gray-100 hover:border-purple-200"
                          onClick={() => handleQuestionClick(question)}
                        >
                          <CardContent className="p-6">
                            <p className="text-gray-700 leading-relaxed">{question}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 rounded-full bg-white shadow-md hover:bg-gray-50"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 rounded-full bg-white shadow-md hover:bg-gray-50"
                  onClick={nextSlide}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-center mt-4 space-x-2">
                {recommendedQuestions.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? "bg-purple-600" : "bg-gray-300"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {ctaButtons.map((button, index) => (
                <Card key={index} className={`cursor-pointer transition-all hover:shadow-lg border-2 ${button.color}`}>
                  <CardContent className="p-6 text-center">
                    <button.icon className="w-8 h-8 mx-auto mb-3 text-gray-700" />
                    <h3 className="font-semibold text-gray-900 mb-2">{button.title}</h3>
                    <p className="text-sm text-gray-600">{button.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-sm text-gray-600 leading-relaxed text-center">
                <strong className="text-gray-800">퍼슬리</strong>는 공신력 있는 기관의 공인된 정보만을 검색해 안내합니다.
                진단/처방을 비롯한 의료행위를 하지 않으며 보건복지부의 비의료 건강관리서비스 가이드라인을 준수합니다.
              </p>
            </div>
          </>
        ) : (
          // Chat-focused layout when chat has started
          <div className="flex flex-col h-[calc(100vh-120px)]">
            {/* Chat Display - Takes most of the vertical space */}
            <div className="flex-1 overflow-hidden">
              <ChatDisplay messages={messages} isLoading={isLoading} />
            </div>

            {/* Fixed Chat Input at Bottom */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <div className="relative max-w-2xl mx-auto">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="건강 고민을 자유롭게 말씀해 주세요..."
                  className="pl-4 pr-12 py-4 text-lg rounded-2xl border-2 border-gray-200 focus:border-purple-400 shadow-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-purple-600 hover:bg-purple-700"
                  disabled={!inputText.trim() || isLoading}
                  onClick={handleSubmit}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Small Recommended Questions Bar at Bottom */}
            <div className="bg-gray-50 border-t border-gray-200 p-3">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">추천 질문:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
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
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={nextSlide}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-purple-600 hover:text-purple-700"
                    onClick={() => handleQuestionClick(recommendedQuestions[currentSlide])}
                  >
                    사용하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
