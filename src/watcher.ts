import { waitForDebugger } from "inspector";
import { Browser, ElementHandle, Page } from "puppeteer";
import { BASE_URL, BOOK_URL, RPM_URL, CRENEAUX_URL } from "./constants";
import { log } from "./logging";
import { ISeance, ISport } from "./types";
import { formatDayDate, sleep } from "./utils";

export const sports = [
  {
    url: RPM_URL,
    name: "RPM",
    lastValue: Number.MAX_SAFE_INTEGER,
    tarif: "1195387",
    next_period: { begin_end: "", period_id: "", url: "", seances: [] },
    id: 24,
    niveau: 0,
    ready: false,
  },
] as ISport[];

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

  const resp = await page.goto(BOOK_URL, {
    timeout: 0,
  });

  const oui = await page
    .waitForSelector("text/OUI", { timeout: 10000 })
    .catch(() => null);

  if (oui) await oui.click();
  await page.evaluate(() => {
    const inputs = document.getElementsByTagName("input");
    inputs[1].click();
  });

  log(["Going to return page, I am connected"]);

  return page;
}

async function prepareNextPeriod(
  page: Page,
  sport: ISport,
  slotsSelector: ElementHandle<Element>
) {
  const slots = await slotsSelector?.evaluate((el) => {
    return Array.from(el.children).map((child) => {
      const period = (child as HTMLInputElement).value;
      return {
        begin_end: child.innerHTML,
        period_id: period,
      };
    });
  });
  if (!slots) throw new Error("slots is undefined");

  sport.next_period = slots[slots.length - 1];
  sport.next_period.url = `${CRENEAUX_URL}&niveau=${sport.niveau}&periode=${sport.next_period.period_id}&tarif=${sport.tarif}`;

  await page.goto(sport.next_period.url!, {
    timeout: 0,
  });

  const seances = await page.$$eval("table", (el) => {
    const table = el[1] as HTMLTableElement;
    const rows = Array.from(table.rows);
    const parsed = rows.map((row) => {
      const cell = Array.from(row.children);
      const date = (cell[0] as any).innerText;
      const hours = (cell[1] as any).innerText
        .replace(/(\r\n|\n|\r|\t)/gm, " ")
        .split(" ")
        .filter((el: string) => el.includes(">"));
      return { date: date, plage: hours } satisfies ISeance;
    });
    return parsed;
  });
  sport.next_period.seances = seances;
}

export async function checkSport(page: Page, sport: ISport) {
  try {
    log(["Let's check " + sport.name]);
    await page.goto(sport.url, {
      timeout: 0,
    });

    if (
      page.url() ===
      "https://moncentreaquatique.com/module-inscriptions/residence/"
    ) {
      const oui = await page
        .waitForSelector("text/OUI", { timeout: 10000 })
        .catch(() => null);
      if (oui) await oui.click();
      const button = await page.waitForSelector('input[value="CONTINUER"]');
      await button?.click();
      await page.goto(sport.url, {
        timeout: 0,
      });
    }

    const slots = await page.waitForSelector("#liste_periodes", {
      timeout: 0,
    });
    if (!slots) return false;

    let length = await slots?.evaluate((el) => {
      return el.children.length;
    });
    if (length === undefined) throw new Error("length is undefined");

    log([
      "There are " + length + " slots " + " last value is " + sport.lastValue,
    ]);

    // if (length > sport.lastValue) {
    sport.lastValue = length;

    await prepareNextPeriod(page, sport, slots);

    sport.ready = true;
    return true;
    // } else log(["Nothing to do here"]);
    sport.lastValue = length;
    sport.ready = false;
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}
