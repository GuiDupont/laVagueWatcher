import moment from "moment";
import { sendMessageManagement } from "./telegram/telegramBot";
import { ISport } from "./types/types";

export async function sleep(ms: number) {
  process.env.program_status = "SLEEPING";
  const duration = convertTimestampToTimePast(ms);
  sendMessageManagement(`Sleeping for ${duration} ms`);
  log([`Sleeping for ${duration}`]);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function daysInMinutes(days: number) {
  return days * 24 * 60;
}

export async function sleepSeconds(seconds: number) {
  return sleep(1000 * seconds);
}

export async function sleepMinutes(minutes: number) {
  return sleepSeconds(60 * minutes);
}

export async function sleepHours(hours: number) {
  return sleepMinutes(60 * hours);
}

export function getPath() {
  if (onMac())
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "/usr/bin/chromium-browser";
}

function onMac() {
  return process.platform === "darwin";
}

export function formatDayDate(s: string) {
  const day = s.split("\n")[0];
  const date = s.split("\n")[1];
  return `${day} ${date.slice(0, date.length - 5)}`;
}

export function log(messages: any[] | string) {
  if (typeof messages === "string")
    console.log("[" + moment().format() + "] ", messages);
  else console.log("[" + moment().format() + "] ", ...messages);
}

export function isTest() {
  return process.argv.includes("test");
}

export function isDebug() {
  return process.argv.includes("debug");
}

export function nextPeriodIsPrepared(sport: ISport) {
  return sport.next_period.allSeances?.length !== 0;
}

export function convertTimestampToTimePast(timestamp: number) {
  const timestampInSeconds = timestamp / 1000;

  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  if (timestampInSeconds >= DAY) {
    const days = Math.floor(timestampInSeconds / DAY);
    return `${days} day${days > 1 ? "s" : ""}`;
  } else if (timestampInSeconds >= HOUR) {
    const hours = Math.floor(timestampInSeconds / HOUR);
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  } else if (timestampInSeconds >= MINUTE) {
    const minutes = Math.floor(timestampInSeconds / MINUTE);
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else {
    return `${Math.floor(timestampInSeconds)} second${
      Math.floor(timestampInSeconds) !== 1 ? "s" : ""
    }`;
  }
}
