import axios, { AxiosError } from "axios";
import { OpenAIError, OpenAIResponse } from "./types/openai";

export const checkOpenAIAPIKey = async (apiKey: string) => {
  try {
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
  } catch (err) {
    const axiosError = err as AxiosError<{ error: OpenAIError }>;
    const error = axiosError.response?.data?.error;
    if (error) {
      return { error };
    }
  }
};

export const checkKoboldURL = async (url: string) => {};
