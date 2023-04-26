export interface KoboldResponse {
  results: Array<{ text: string }>;
}

export interface KoboldError {
  detail: object;
}
