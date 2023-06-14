import { Page } from "puppeteer";
import { ISport } from "../types/types";
import { log } from "../utils";

export async function goToSportMainPage(page: Page, sport: ISport) {
  try {
    console.log(page.url());
    await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
    await page.goto(sport.url, {
      timeout: 0,
    });
    await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
    if (
      page.url() ===
      "https://moncentreaquatique.com/module-inscriptions/residence/"
    ) {
      const oui = await page
        .waitForSelector("text/OUI", { timeout: 10_000 })
        .catch(() => null);
      if (oui) {
        await oui.click();
        await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);
      }
      const button = await page.waitForSelector('input[value="CONTINUER"]', {
        timeout: 0,
      });
      await button?.click();
      await page.waitForNetworkIdle({ timeout: 2_000 }).catch(() => null);

      await page.goto(sport.url, {
        timeout: 0,
      });
    }
  } catch (e) {
    console.log("error here", e);
    throw e;
  }
}
