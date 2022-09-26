import { readFileSync, writeFileSync } from "fs";
import { Page } from "puppeteer";

export async function reuseCookies(page: Page) {
  const cookiesString = readFileSync("./cookies.json");
  const cookies = JSON.parse(cookiesString.toString());
  await page.setCookie(...cookies);
}

export async function saveCookies(page: Page) {
  const cookies = await page.cookies();
  writeFileSync("./cookies.json", JSON.stringify(cookies, null, 2));
}
