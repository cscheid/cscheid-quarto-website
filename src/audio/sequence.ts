import { delay } from "../utils/delay.ts";

export async function sequence(
  calls: (() => void)[],
  delayAmount: number,
) {
  if (!(window as any).player) {
    return;
  }
  for (const call of calls) {
    call();
    await delay(delayAmount);
  }
}
