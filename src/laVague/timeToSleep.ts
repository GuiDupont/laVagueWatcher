import { ISport } from "../types";

export function timeToSleep(sports: ISport[]) {
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
