import { Browser, Page } from "puppeteer";
import { BASE_URL, BOOK_URL } from "../constants";
import { log } from "../utils";

export async function loginLaVague(browser: Browser) {
  let page: Page;

  page = await browser!.newPage();
  page.setDefaultTimeout(0);
  page.on("load", () => {
    const content = `
        *,
        *::after,
        *::before {
          transition-delay: 0s !important;
          transition-duration: 0s !important;
          animation-delay: -0.0001s !important;
          animation-duration: 0s !important;
          animation-play-state: paused !important;
          caret-color: transparent !important;
        }`;
    page.addStyleTag({ content });
  });
  await page.goto(BASE_URL, {
    timeout: 0,
  });

  log(["I am in ", BASE_URL]);
  log(["About to connect"]);
  const email = await page.waitForSelector('input[name="email"]', {
    timeout: 0,
  });

  await email?.type(process.env.EMAIL!);
  const password = await page.waitForSelector('input[name="password"]', {
    timeout: 0,
  });
  await password?.type(process.env.PASSWORD!);

  const submit = await page.waitForSelector('input[value="CONNEXION"]', {
    timeout: 0,
  });

  if (submit) await submit?.click();
  await page.waitForNetworkIdle({ timeout: 0 });
  log(["About to go to book_url"]);

  await page.goto(BOOK_URL, {
    timeout: 0,
  });
  const oui = await page
    .waitForSelector("text/OUI", { timeout: 10000 })
    .catch(() => null);
  if (oui) {
    log(["In oui"]);

    await oui.click();
    await page.waitForNetworkIdle({ timeout: 0 });
  }
  log(["About to continuer"]);

  const continuer = await page.waitForSelector('input[value="CONTINUER"]', {
    timeout: 0,
  });
  await continuer?.click();
  await page.waitForNetworkIdle({ timeout: 0 });

  log(["Going to return page, I am connected"]);

  return page;
}
