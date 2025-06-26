export interface ChatResponse {
  output: string;
  threadId?: string;
}

interface ThreadMessage {
  id: string;
  role: string;
  content: Array<{
    type: string;
    text: {
      value: string;
    };
  }>;
}

// OpenAI API 설정 객체
const OPENAI_CONFIG = {
  baseUrl: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2'
  }
} as const;

// 공통 헤더 생성 함수
function createHeaders(apiKey: string) {
  return {
    ...OPENAI_CONFIG.headers,
    'Authorization': `Bearer ${apiKey}`
  };
}

// API 호출을 위한 공통 함수
async function makeOpenAIRequest(
  endpoint: string, 
  apiKey: string, 
  options: RequestInit = {}
): Promise<any> {
  const url = `${OPENAI_CONFIG.baseUrl}${endpoint}`;
  const headers = createHeaders(apiKey);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Thread 관련 함수들
const threadAPI = {
  // 새 Thread 생성
  async create(apiKey: string): Promise<string> {
    const data = await makeOpenAIRequest('/threads', apiKey, {
      method: 'POST'
    });
    return data.id;
  },

  // Thread에 메시지 추가
  async addMessage(threadId: string, apiKey: string, content: string): Promise<void> {
    await makeOpenAIRequest(`/threads/${threadId}/messages`, apiKey, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content
      })
    });
  },

  // Thread의 메시지들 가져오기
  async getMessages(threadId: string, apiKey: string): Promise<ThreadMessage[]> {
    const data = await makeOpenAIRequest(`/threads/${threadId}/messages`, apiKey);
    return data.data;
  }
};

// Run 관련 함수들
const runAPI = {
  // Assistant 실행 시작
  async create(threadId: string, assistantId: string, apiKey: string): Promise<string> {
    const data = await makeOpenAIRequest(`/threads/${threadId}/runs`, apiKey, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });
    return data.id;
  },

  // Run 상태 확인
  async getStatus(threadId: string, runId: string, apiKey: string): Promise<string> {
    const data = await makeOpenAIRequest(`/threads/${threadId}/runs/${runId}`, apiKey);
    return data.status;
  },

  // Run 완료까지 대기
  async waitForCompletion(threadId: string, runId: string, apiKey: string): Promise<void> {
    let status = 'queued';
    const maxAttempts = 60; // 최대 60초 대기
    let attempts = 0;

    while ((status === 'queued' || status === 'in_progress') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      status = await this.getStatus(threadId, runId, apiKey);
      attempts++;

      if (status === 'failed') {
        throw new Error('Assistant run failed');
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Assistant run timed out');
    }
  }
};

// 응답 텍스트 정리 함수
function cleanResponseText(text: string): string {
  // "【숫자:숫자†source】" 패턴 제거
  const citationPattern = /【\d+:\d+†source】/g;
  
  // 여러 공백을 하나로 정리
  const cleanedText = text
    .replace(citationPattern, '') // 인용 패턴 제거
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .trim(); // 앞뒤 공백 제거
  
  return cleanedText;
}

// 메인 챗봇 메시지 전송 함수
export async function sendMessageToBot(utterance: string, threadId?: string): Promise<ChatResponse> {
  try {
    // 환경 변수 확인
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const assistantId = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID;
    
    if (!apiKey || !assistantId) {
      throw new Error('OpenAI API Key or Assistant ID is not configured');
    }

    let currentThreadId = threadId;

    // 1. Thread가 없으면 새로 생성
    if (!currentThreadId) {
      currentThreadId = await threadAPI.create(apiKey);
    }

    // 2. 사용자 메시지를 Thread에 추가
    await threadAPI.addMessage(currentThreadId, apiKey, utterance);

    // 3. Assistant 실행
    const runId = await runAPI.create(currentThreadId, assistantId, apiKey);

    // 4. Run 완료까지 대기
    await runAPI.waitForCompletion(currentThreadId, runId, apiKey);

    // 5. Assistant 응답 가져오기
    const messages = await threadAPI.getMessages(currentThreadId, apiKey);
    const assistantMessage = messages.find((msg: ThreadMessage) => msg.role === 'assistant');

    if (!assistantMessage) {
      throw new Error('No assistant response found');
    }

    // 6. 응답 텍스트 정리
    const rawResponse = assistantMessage.content[0]?.text?.value || '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.';
    const cleanedResponse = cleanResponseText(rawResponse);

    return {
      output: cleanedResponse,
      threadId: currentThreadId
    };
  } catch (error) {
    console.error('Error calling OpenAI Assistant API:', error);
    return {
      output: '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.'
    };
  }
} 