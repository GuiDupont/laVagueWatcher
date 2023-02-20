import { ISport } from "../types/types";

export function timeToSleep(sports: ISport[]) {
  if (process.env.SLEEP != "0") {
    const sleep = parseInt(process.env.SLEEP!);
    process.env.SLEEP = "0";
    return sleep;
  }
  let oneSportIsNotReady = false;
  let oneSportIsReady = false;
  let fastMode = false;
  sports.forEach((sport) => {
    if (sport.ready) oneSportIsReady = true;
    else oneSportIsNotReady = true;
    if (sport.lastValue === 2) fastMode = true;
  });
  if (!fastMode) return 100; // slow mode
  else if (oneSportIsReady && oneSportIsNotReady) return 1; // urgence !!
  else return 5; // fast mode
}
