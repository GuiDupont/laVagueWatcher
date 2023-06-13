import moment from "moment";
import { sendMessageManagement } from "../telegram/telegramBot";
import { ISport } from "../types/types";

function isSleepTime() {
  const currentHour = moment().hours();
  return currentHour >= 22 && currentHour <= 24;
}

function isExceptionnalSleepSet() {
  return (
    process.env.EXCEPTIONNAL_SLEEP !== "0" &&
    process.env.EXCEPTIONNAL_SLEEP !== undefined
  );
}

export function minutesToSleep(sports: ISport[]) {
  if (isSleepTime()) return 60 * 8; // 8 hours
  if (isExceptionnalSleepSet()) {
    process.env.EXCEPTIONNAL_SLEEP = "0";
    return parseInt(process.env.EXCEPTIONNAL_SLEEP!);
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
