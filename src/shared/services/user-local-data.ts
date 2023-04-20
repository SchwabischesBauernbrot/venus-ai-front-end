export interface UserLocalData {
  theme: "light" | "dark";
  openAIKey?: string;
}

const LOCAL_DATA_KEY = "local-data";

export const defaultUserLocalData: UserLocalData = { theme: "light" };

export const getLocalData = (): UserLocalData => {
  const data = localStorage.getItem(LOCAL_DATA_KEY);
  try {
    const localData: UserLocalData = JSON.parse(data || "");
    return localData;
  } catch {
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(defaultUserLocalData));
    return defaultUserLocalData;
  }
};

export const saveLocalData = (data: UserLocalData) => {
  localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
};
