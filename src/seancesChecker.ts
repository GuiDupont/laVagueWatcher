import { Browser, Page, PuppeteerNode } from "puppeteer";
import { getPath, inTestEnv, log, sleepSeconds } from "./utils";
import { BASE_URL, BOOK_URL } from "./data/constants";
import { sports as SportsRaw } from "./data/sports";
import { sendMessage } from "./telegram/telegramBot";
import { seancesBooker } from "./seancesBooker";
import { ISport } from "./types/types";
import { goToSportMainPage } from "./laVague/sportMainPage";
const puppeteer: PuppeteerNode = require("puppeteer");

export class seancesChecker {
  browser: Browser | undefined;
  page: Page | undefined;
  checkingIsOver: boolean = false;
  sports = SportsRaw;
  booker: seancesBooker | undefined;
  constructor() {}

  async init() {
    await this.setUpBrowser();
    await this.setPage();
    return this;
  }
  async setUpBrowser() {
    let headless = true;
    if (process.argv[2].includes("test")) headless = false;
    try {
      log("opening browser...");
      this.browser = await puppeteer.launch({
        headless: headless,
        defaultViewport: null,
        // userDataDir: "./chrome_data",
        executablePath: getPath(),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      log("setting up page...");
    } catch (err) {
      console.log(err);
      throw new Error("could not create a browser instance");
    }
  }

  async setPage() {
    this.page = await this.browser!.newPage();
    if (!this.page) throw new Error("page is undefined");

    this.page.setDefaultTimeout(0);
    this.page.on("load", () => {
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
      this.page!.addStyleTag({ content });
    });
  }

  async clear() {
    this.closePup();
    this.sports = SportsRaw;
  }

  private async closePup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }

  async loginLaVague() {
    if (!this.page) throw new Error("page is undefined");
    await this.page.goto(BASE_URL, {
      timeout: 0,
    });
    const email = await this.page.waitForSelector('input[name="email"]', {
      timeout: 0,
    });
    await email?.type(process.env.EMAIL!);
    const password = await this.page.waitForSelector('input[name="password"]', {
      timeout: 0,
    });
    await password?.type(process.env.PASSWORD!);
    const submit = await this.page.waitForSelector('input[value="CONNEXION"]', {
      timeout: 0,
    });
    if (submit) {
      await submit?.click();
      await this.page
        .waitForNetworkIdle({ timeout: 10_000 })
        .catch(() => console.log("fail"));
    }
  }

  async goToActivityPage() {
    if (!this.page) throw new Error("page is undefined");
    await this.page
      .goto(BOOK_URL, {
        timeout: 0,
      })
      .catch(() => log(["in go to book url fail"]));

    const oui = await this.page
      .waitForSelector("text/OUI", { timeout: 2_000 })
      .catch(() => null);
    if (oui) {
      await oui.click();
      await this.page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
    } else await sleepSeconds(3);

    const continuer = await this.page.waitForSelector(
      'input[value="CONTINUER"]',
      {
        timeout: 0,
      }
    );
    await continuer?.click();
    await this.page.waitForNavigation({ timeout: 2_000 }).catch(() => null);
    await this.page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
  }

  async getListe_periodesLength(sport: ISport) {
    log(["Let's check " + sport.name]);
    if (!this.page) throw new Error("page is undefined");

    await goToSportMainPage(this.page, sport).catch(() => {
      log(["Error in goToSportMainPage"]);
    });
    log(["after goToSportMainPage"]);
    log(["I am in " + sport.name + " page"]);
    const slots = await this.page.waitForSelector("#liste_periodes", {
      timeout: 0,
    });
    log(["I have slots " + sport.name + " page"]);
    if (!slots) return 0;

    let length = await slots?.evaluate((el) => {
      return el.children.length;
    });
    if (length === undefined) throw new Error("length is undefined");
    return length;
  }

  async checkSportReadiness(sport: ISport) {
    try {
      const length = await this.getListe_periodesLength(sport);

      if (inTestEnv() || length > sport.lastValue) {
        sport.ready = true;
        await sendMessage("I can book a seance for " + sport.name);
      } else sport.ready = false;
      sport.lastValue = length;
    } catch (err) {
      log(["Error in checkSport: ", sport.name]);
      throw err;
    }
  }

  checkCheckingIsOver() {
    this.checkingIsOver = true;
    this.sports.forEach((s: ISport) => {
      if (!s.booked) this.checkingIsOver = false;
    });
  }

  async checkSportsReadiness() {
    for (let i = 0; i < this.sports.length; i++) {
      if (this.sports[i].booked || this.sports[i].ready) continue;
      await this.checkSportReadiness(this.sports[i]);
      this.checkCheckingIsOver();
    }
  }

  async bookSportsReady() {
    this.booker = new seancesBooker(this.page!, this.sports);
    await this.booker.bookSportsReady();
  }
}
