import axios, { AxiosError } from "axios";
import { axiosInstance } from "../../../config";
import { UserConfig } from "../../../shared/services/user-config";
import { OpenAIError, OpenAIResponse } from "./types/openai";

type OpenAIMode = Required<UserConfig>["open_ai_mode"];

export interface CheckInput {
  mode: OpenAIMode;
  apiKey?: string;
  proxy?: string;
  proxyKey?: string;
}

export const checkOpenAIKeyOrProxy = async ({ mode, apiKey, proxy, proxyKey }: CheckInput) => {
  try {
    const baseUrl = mode === "api_key" ? "https://api.openai.com/v1" : proxy;

    const authorizationHeader = (() => {
      if (mode === "api_key" && apiKey) {
        return `Bearer ${apiKey}`;
      }

      if (mode === "proxy" && proxyKey) {
        return `Bearer ${proxyKey}`;
      }

      return "";
    })();

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
          Authorization: authorizationHeader,
        },
      }
    );
    return response.data;
  } catch (err) {
    const axiosError = err as AxiosError<{ error: OpenAIError }>;

    console.log(axiosError.response?.data);

    const error = axiosError.response?.data?.error;
    if (error) {
      return { error };
    }
  }
};

export const getValidKoboldUrlApi = (url: string) => {
  const koboldUrl = new URL(url);
  koboldUrl.pathname = "/api";
  const apiUrl = koboldUrl.toString();
  return apiUrl.replace("localhost", "127.0.0.1");
};

export const checkKoboldURL = async (url: string) => {
  try {
    const response = await axiosInstance.get<{ result: string }>(
      `${getValidKoboldUrlApi(url)}/v1/model`
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
