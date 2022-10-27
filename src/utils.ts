function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sleepHours(hours: number) {
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
