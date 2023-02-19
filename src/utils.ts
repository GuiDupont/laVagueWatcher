import moment from "moment";

export async function sleep(ms: number) {
  process.env.program_status = "SLEEPING";

  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sleepSeconds(seconds: number) {
  log([`Time to sleep ${seconds} seconds`]);
  return sleep(1000 * seconds);
}

export async function sleepMinutes(minutes: number) {
  log([`Time to sleep ${minutes} minutes`]);
  return sleep(1000 * 60 * minutes);
}

export async function sleepHours(hours: number) {
  log([`Time to sleep ${hours} hours`]);
  return sleep(1000 * 60 * 60 * hours);
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
  console.log("[" + moment().format() + "] ", ...messages);
}
