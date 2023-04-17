import delay from "delay";

export async function* generate(prompt: string) {
  const finalResult = `${prompt} ${prompt} ${prompt} ${Math.random()}`;
  const words = finalResult.split(" ");
  for (const word of words) {
    await delay(100);
    yield word + " ";
  }
}
