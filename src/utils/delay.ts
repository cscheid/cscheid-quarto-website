export async function delay(timeInMillis: number) {
  await new Promise((res, _rej) => setTimeout(res, timeInMillis));
}
