import moment from "moment";
import { sendMessageManagement } from "./telegram/telegramBot";

export async function sleep(ms: number) {
  process.env.program_status = "SLEEPING";
  sendMessageManagement(`Sleeping for ${ms} ms`);
  log([`Sleeping for ${ms} ms`]);
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  if (process.platform === "darwin")
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "/usr/bin/chromium-browser";
}

export function formatDayDate(s: string) {
  const day = s.split("\n")[0];
  const date = s.split("\n")[1];
  return `${day} ${date.slice(0, date.length - 5)}`;
}

export function log(messages: any[] | string) {
  if (typeof messages === "string") messages = [messages];

  console.log("[" + moment().format() + "] ", ...messages);
}
