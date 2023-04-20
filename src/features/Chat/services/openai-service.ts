interface OpenAIResponse {
  error?: OpenAIError;
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

interface OpenAIError {
  code: string;
  message: string;
  param: object | null;
  type: string;
}

export const checkOpenAIAPIKey = async (apiKey: string) => {
  const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 10,
      messages: [{ role: "user", content: "Just say TEST" }],
    }),
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const result: OpenAIResponse = await response.json();

  return result;
};
