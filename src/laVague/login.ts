import { Browser, Page } from "puppeteer";
import { BASE_URL, BOOK_URL } from "../data/constants";
import { log, sleepSeconds } from "../utils";

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

  if (submit) {
    await submit?.click();
    log(["Here submit is ", submit]);

    await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
  }
  log(["About to go to book_url"]);

  await page.goto(BOOK_URL, {
    timeout: 0,
  });
  log(["aFter book url"]);

  // await page.waitForNetworkIdle({ timeout: 0 });
  log(["After network idle"]);
  const oui = await page
    .waitForSelector("text/OUI", { timeout: 2_000 })
    .catch(() => null);
  log(["After oui"]);
  if (oui) {
    log(["In oui"]);

    await oui.click();
    await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
  } else await sleepSeconds(3);
  log(["About to continuer"]);

  const continuer = await page.waitForSelector('input[value="CONTINUER"]', {
    timeout: 0,
  });
  console.log("continuer", continuer);
  await continuer?.click();
  console.log(page.url());
  await page.waitForNavigation({ timeout: 2_000 }).catch(() => null);
  await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
  log(["Going to return page, I am connected"]);
  console.log(page.url());

  return page;
}
