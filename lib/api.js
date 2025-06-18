/**
 * API helper functions for the ChatBot component
 * Handles communication with the n8n webhook endpoint
 */

// Configuration for the webhook endpoint
const WEBHOOK_URL = 'https://my-n8n-server.com/webhook/chatbot';

/**
 * Sends a message to the webhook endpoint and returns the bot's response
 * @param {string} message - The user's message to send
 * @returns {Promise<Object>} - The response from the bot containing { reply: string }
 */
export async function sendMessageToBot(message) {
  try {
    // Send POST request to webhook with user message
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response JSON
    const data = await response.json();
    
    // Return the bot's reply
    return data;
  } catch (error) {
    // Log error for debugging
    console.error('Error sending message:', error);
    
    // Return error response
    throw new Error('Failed to send message. Please try again.');
  }
} 