import { UserConfigAndLocalData } from "../../../shared/services/user-config";
import { SupaChatMessage } from "../../../types/backend-alias";

// Separate this into a service, so later we can use different model
export async function* summaryUsingOpenAI(
  chatHistory: SupaChatMessage[],
  config: UserConfigAndLocalData
) {
  yield "Summary";
}
