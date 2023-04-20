import axios from "axios";

interface OpenAIResponse {
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

export const checkOpenAIAPIKey = async (apiKey: string) => {
  const response = await axios.post<OpenAIResponse>(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 10,
      messages: [{ role: "user", content: "Just say TEST" }],
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  return response.data;
};

export const checkKoboldURL = async (url: string) => {};
