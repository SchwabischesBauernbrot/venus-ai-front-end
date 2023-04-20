export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
}

export interface OpenAIError {
  code: string;
  message: string;
  param: object | null;
  type: string;
}

export interface OpenAIProxyError {
  message: string;
  proxy_note: string;
  stack: string;
  type: string;
}

export interface OpenAIInputMessage {
  role: "system" | "assistant" | "user";
  content: string;
}
