export interface ChatResponse {
  output: string;
}

export async function sendMessageToBot(utterance: string): Promise<ChatResponse> {
  try {
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      throw new Error('N8N webhook URL is not configured');
    }

    const payload = {
      action: 'sendMessage',
      chatInput: utterance,
      sessionId: Date.now().toString() // 임시 세션 ID. 필요시 실제 사용자 ID로 대체
    };

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return {
      output: data?.output || '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.'
    };
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    return {
      output: '죄송합니다. 답변을 생성하는 중 오류가 발생했습니다.'
    };
  }
} 