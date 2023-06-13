import moment from "moment";
import { sendMessageManagement } from "./telegram/telegramBot";

export async function sleep(ms: number) {
  process.env.program_status = "SLEEPING";
  sendMessageManagement(`Sleeping for ${ms} ms`);
  log([`Sleeping for ${ms} ms`]);
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
  // if (!onMac()) return;
  if (typeof messages === "string")
    console.log("[" + moment().format() + "] ", messages);
  else console.log("[" + moment().format() + "] ", ...messages);
}

export function inTestEnv() {
  return process.argv.includes("test");
}
