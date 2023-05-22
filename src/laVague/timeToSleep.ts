import { ISport } from "../types/types";

// time to sleep in minutes

export function timeToSleep(sports: ISport[]) {
  if (
    process.env.SLEEP_MINUTES !== "0" &&
    process.env.SLEEP_MINUTES !== undefined
  ) {
    const sleep = parseInt(process.env.SLEEP_MINUTES!);
    process.env.SLEEP_MINUTES = "0";
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
  if (!fastMode) return 60; // slow mode
  else if (oneSportIsReady && oneSportIsNotReady) return 1; // urgence !!
  else return 5; // fast mode
}
