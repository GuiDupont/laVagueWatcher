import { Page } from "puppeteer";
import { ISport } from "../types/types";
import { log, sleepSeconds } from "../utils";

export async function goToSportMainPage(page: Page, sport: ISport) {
  try {
    log("go to sport main page");
    console.log(page.url());
    await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
    await page.goto(sport.url, {
      timeout: 0,
    });
    log("after go to");
    console.log("");
    await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
    log("wait for network idle done");
    if (
      page.url() ===
      "https://moncentreaquatique.com/module-inscriptions/residence/"
    ) {
      log("we are on the residence page");
      const oui = await page
        .waitForSelector("text/OUI", { timeout: 10_000 })
        .catch(() => null);
      if (oui) {
        log("let's click on oui");
        await oui.click();
        log("let's wait for network idle done");
        await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
      }
      log("let's find continuer bouton");
      const button = await page.waitForSelector('input[value="CONTINUER"]', {
        timeout: 0,
      });
      log("let's click on continuer");
      await button?.click();
      log("let's wait for network idle done");
      await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
      log("let's go to sport main page");

      await page.goto(sport.url, {
        timeout: 0,
      });
    }
  } catch (e) {
    console.log("error here", e);
    log("let's throw the error");
    throw e;
  }
}
