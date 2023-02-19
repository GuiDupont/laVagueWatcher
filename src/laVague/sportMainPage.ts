import { Page } from "puppeteer";
import { ISport } from "../types";
import { log } from "../utils";

export async function goToSportMainPage(page: Page, sport: ISport) {
  try {
    await page.goto(sport.url, {
      timeout: 0,
    });

    await page.waitForNetworkIdle({ timeout: 0 });

    if (
      page.url() ===
      "https://moncentreaquatique.com/module-inscriptions/residence/"
    ) {
      const oui = await page
        .waitForSelector("text/OUI", { timeout: 10000 })
        .catch(() => null);
      if (oui) await oui.click();
      await page.waitForNetworkIdle({ timeout: 0 });

      const button = await page.waitForSelector('input[value="CONTINUER"]');
      await button?.click();
      await page.waitForNetworkIdle({ timeout: 0 });
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
