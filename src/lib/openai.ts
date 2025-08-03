import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  content: string;
  tokensUsed: number;
  cost: number; // This will now be in INR
  model: string;
}

// Token pricing per 1K tokens in USD (as of 2024)
const TOKEN_PRICING_USD = {
  'gpt-3.5-turbo': {
    input: 0.0015,
    output: 0.002
  },
  'gpt-4': {
    input: 0.03,
    output: 0.06
  },
  'gpt-4-turbo': {
    input: 0.01,
    output: 0.03
  }
};

// Current USD to INR exchange rate (you can make this dynamic if needed)
const USD_TO_INR_RATE = 160; // Update this periodically or fetch from an API

export async function generateChatbotResponse(
  messages: ChatMessage[],
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' = 'gpt-3.5-turbo',
  temperature: number = 0.7,
  maxTokens: number = 500,
  userId?: string
): Promise<OpenAIResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    // Calculate cost in USD first
    const pricing = TOKEN_PRICING_USD[model];
    const costUSD = (inputTokens / 1000 * pricing.input) + (outputTokens / 1000 * pricing.output);
    
    // Convert to INR
    const costINR = costUSD * USD_TO_INR_RATE;

    return {
      content: response,
      tokensUsed,
      cost: costINR, // Now in INR
      model
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

// Function to validate OpenAI API key
export async function validateOpenAIKey(): Promise<boolean> {
  try {
    await openai.models.list();
    return true;
  } catch (error) {
    console.error('OpenAI API key validation failed:', error);
    return false;
  }
}

// Function to estimate token count (rough estimation)
export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

// Function to calculate estimated cost in INR
export function estimateCost(
  inputText: string,
  outputText: string,
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo'
): number {
  const inputTokens = estimateTokenCount(inputText);
  const outputTokens = estimateTokenCount(outputText);
  const pricing = TOKEN_PRICING_USD[model];
  
  const costUSD = (inputTokens / 1000 * pricing.input) + (outputTokens / 1000 * pricing.output);
  return costUSD * USD_TO_INR_RATE; // Return in INR
}

// Helper function to get current exchange rate (you can make this dynamic)
export function getUSDToINRRate(): number {
  return USD_TO_INR_RATE;
}

// Helper function to convert USD to INR
export function convertUSDToINR(usdAmount: number): number {
  return usdAmount * USD_TO_INR_RATE;
}