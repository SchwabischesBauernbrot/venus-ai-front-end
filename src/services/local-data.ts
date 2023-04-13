export interface LocalData {
  theme: "light" | "dark";
}

const LOCAL_DATA_KEY = "local-data";

export const defaultLocalData: LocalData = { theme: "light" };

export const getLocalData = (): LocalData => {
  const data = localStorage.getItem(LOCAL_DATA_KEY);
  try {
    const localData: LocalData = JSON.parse(data || "");
    return localData;
  } catch {
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(defaultLocalData));
    return defaultLocalData;
  }
};

export const saveLocalData = (data: LocalData) => {
  localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
};
