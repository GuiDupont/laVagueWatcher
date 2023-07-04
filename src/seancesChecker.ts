import { Browser, Page, PuppeteerNode } from "puppeteer";
import { getPath, isTest, log, sleep, sleepSeconds } from "./utils";
import { BASE_URL, BOOK_URL } from "./data/constants";
import { sports as SportsRaw } from "./data/sports";
import { sendMessage } from "./telegram/telegramBot";
import { seancesBooker } from "./seancesBooker";
import { ISport } from "./types/types";

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
    let headless = isTest() ? false : true;
    try {
      log("opening browser...");
      this.browser = await puppeteer.launch({
        headless: headless,
        defaultViewport: null,
        // userDataDir: "./chrome_data",
        executablePath: getPath(),
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (err) {
      log([err]);
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

  async resetSports() {
    this.sports = SportsRaw;
  }

  async close() {
    if (this.page) {
      this.page.removeAllListeners();
      await this.page.close();
    }
    if (this.browser) {
      this.browser.removeAllListeners();
      await this.browser.close();
    }
  }

  async loginLaVague() {
    if (!this.page) throw new Error("page is undefined");

    try {
      await this.page
        .goto(BASE_URL, {
          timeout: 15_000,
        })
        .catch(() => {
          throw new Error("Can't go to base url");
        });
      const email = await this.page
        .waitForSelector('input[name="email"]', {
          timeout: 15_000,
        })
        .catch(() => {
          throw new Error("Can't get email input");
        });
      await email?.type(process.env.EMAIL!).catch(() => {
        throw new Error("Can't type email");
      });
      const password = await this.page
        .waitForSelector('input[name="password"]', {
          timeout: 15_000,
        })
        .catch(() => {
          throw new Error("Can't get password input");
        });
      await password?.type(process.env.PASSWORD!).catch(() => {
        throw new Error("Can't type password");
      });
      const submit = await this.page
        .waitForSelector('input[value="CONNEXION"]', {
          timeout: 15_000,
        })
        .catch(() => {
          throw new Error("Can't get submit button");
        });
      if (submit) {
        await submit?.click().catch(() => {
          throw new Error("Can't click submit button");
        });
        await this.page!.waitForNetworkIdle({ timeout: 10_000 }).catch(
          () => null
        ); // wait necessary but can't tell why
      }
    } catch (err: any) {
      log(["Err", err.message]);
      throw new Error("Error : loginLaVague");
    }
  }

  async goToActivityPage() {
    if (!this.page) throw new Error("page is undefined");
    try {
      await this.page
        .goto(BOOK_URL, {
          timeout: 15_000,
        })
        .catch(() => {
          throw new Error("Can't go to book url");
        });
    } catch (err) {
      log(["Error : ", err]);
      throw new Error("Error : go to activity page");
    }
    try {
      await this.handleModuleInscriptionResidence();
    } catch (err) {
      log(["Error : handle module Inscription residence", err]);
      throw new Error("Error : go to activity page");
    }
  }

  async handleModuleInscriptionResidence() {
    if (!this.page) throw new Error("page is undefined");

    const oui = await this.page
      .waitForSelector("text/OUI", { timeout: 10_000 })
      .catch(() => {
        throw new Error("Can't find OUI button");
      });

    if (oui) {
      await oui.click().catch(() => {
        throw new Error("Can't click OUI button");
      });
      // await this.page
      //   .waitForNetworkIdle({ timeout: 5_000 })
      //   .catch(() => log("wait network idle 5_000, handle inscription"));
    }

    const continuer = await this.page
      .waitForSelector('input[value="CONTINUER"]', {
        timeout: 15_000,
      })
      .catch(() => {
        throw new Error("Can't find CONTINUER button");
      });

    await continuer?.click().catch(() => {
      throw new Error("Can't click CONTINUER button");
    });
    await this.page
      .waitForNavigation({ timeout: 4_000 })
      .catch(() => log("catch navigation"));
    await this.page
      .waitForNetworkIdle({ timeout: 4_000 })
      .catch(() => log("catch network idle handleModuleInscriptionResidence"));
  }

  async checkSportsReadiness() {
    for (let i = 0; i < this.sports.length; i++) {
      try {
        if (this.sports[i].readyToBeBooked) continue;
        await this.checkSportReadiness(this.sports[i]);
      } catch (err: any) {
        log(["Error in checkSportsReadiness", err.message]);
      }
      // this.checkCheckingIsOver();
    }
  }

  async checkSportReadiness(sport: ISport) {
    try {
      const length = await this.getListe_periodesLength(sport);
      log([sport.name, length]);
      if (isTest() || length > sport.lastValue) {
        sport.readyToBeBooked = true;
        if (!isTest())
          await sendMessage("Je peux réserver une séance de " + sport.name);
      } else sport.readyToBeBooked = false;
      sport.lastValue = length;
    } catch (err) {
      log(["Error in checkSport: ", sport.name]);
      throw err;
    }
  }

  async getListe_periodesLength(sport: ISport) {
    if (!this.page) throw new Error("page is undefined");
    await this.goToSportMainPage(sport).catch(() => {
      // log(["Error in goToSportMainPage"]);
      throw new Error("Error in goToSportMainPage");
    });
    const slots = await this.page
      .waitForSelector("#liste_periodes", {
        timeout: 15_000,
      })
      .catch(() => {
        throw new Error("Can't find #liste_periodes");
      });
    let length = await slots
      ?.evaluate((el) => {
        return el.children.length;
      })
      .catch(() => {
        throw new Error("Can't evaluate slots length");
      });
    if (length === undefined) throw new Error("length is undefined");
    return length;
  }

  async goToSportMainPage(sport: ISport) {
    if (!this.page) throw new Error("page is undefined");

    try {
      await this.page
        .goto(sport.url, {
          timeout: 15_000,
        })
        .catch(() => {
          throw new Error("Can't go to sport url");
        });

      if (
        this.page.url() ===
        "https://moncentreaquatique.com/module-inscriptions/residence/"
      ) {
        this.handleModuleInscriptionResidence();
        await this.page
          .goto(sport.url, {
            timeout: 15_000,
          })
          .catch(() => {
            throw new Error("Can't go to sport url");
          });
      }
    } catch (e) {
      log(["error here", e]);
      throw e;
    }
  }

  async bookSportsReady() {
    if (!this.page) throw new Error("page is undefined");

    this.booker = new seancesBooker(this.page, this.sports, this);
    await this.booker.bookSportsReady();
  }
}
