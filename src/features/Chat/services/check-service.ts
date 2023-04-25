import axios, { AxiosError } from "axios";
import { axiosInstance } from "../../../config";
import { UserConfig } from "../../../shared/services/user-config";
import { OpenAIError, OpenAIResponse } from "./types/openai";

type OpenAIMode = Required<UserConfig>["open_ai_mode"];

export interface CheckInput {
  mode: OpenAIMode;
  apiKey?: string;
  proxy?: string;
}

export const checkOpenAIKeyOrProxy = async ({ mode, apiKey, proxy }: CheckInput) => {
  try {
    const baseUrl = mode === "api_key" ? "https://api.openai.com/v1" : proxy;

    const response = await axios.post<OpenAIResponse>(
      `${baseUrl}/chat/completions`,
      {
        model: "gpt-3.5-turbo",
        temperature: 0,
        max_tokens: 10,
        messages: [{ role: "user", content: "Just say TEST" }],
      },
      {
        headers: {
          Authorization: apiKey ? `Bearer ${apiKey}` : "",
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

export const checkKoboldURL = async (url: string) => {
  try {
    const response = await axiosInstance.get<{ result: string }>(
      `/tunnel/kobold/check?apiUrl=${url}`
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
