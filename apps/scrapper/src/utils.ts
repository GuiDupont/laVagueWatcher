function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sleepRandom(minMS: number, maxMS: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, getRandomInt(minMS, maxMS))
  );
}
