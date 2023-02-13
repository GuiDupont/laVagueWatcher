import { log } from "./logging";

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function sleep(ms: number) {
  process.env.program_status = "SLEEPING";

  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sleepMinutes(minutes: number) {
  log([`Time to sleep ${minutes} minutes`]);
  return sleep(1000 * 60 * minutes);
}

export async function sleepHours(hours: number) {
  log([`Time to sleep ${hours} hours`]);
  return sleep(1000 * 60 * 60 * hours);
}

export async function sleepRandom(minMS: number, maxMS: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, getRandomInt(minMS, maxMS))
  );
}

export function getPath() {
  if (process.platform === "darwin")
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "/usr/bin/chromium-browser";
}

export function formatDayDate(s: string) {
  const day = s.split("\n")[0];
  const date = s.split("\n")[1];
  return `${day} ${date}`;
}
