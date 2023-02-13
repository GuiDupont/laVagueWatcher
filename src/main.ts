import { Browser, Page } from "puppeteer";
import {
  BASE_URL,
  BODYCOMBAT_URL,
  BOOK_URL,
  RPM_URL,
  ZUMBA_URL,
  CAF_URL,
  CT_URL,
} from "./constants";
import startBrowser from "./startBrowser";
import { sleep, sleepHours, sleepMinutes } from "./utils";
import { now } from "moment";
import { log } from "./logging";
import moment from "moment";
import {
  activateBot,
  sendMessage,
  sendMessageManagement,
  setUpInteractions,
} from "./telegramBot";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { checkSport, loginLaVague, sports } from "./watcher";
import { Markup } from "telegraf";

dotenv.config();

let browser: Browser | undefined;

process.env.program_status = "SETTING UP";

async function main() {
  try {
    moment.locale("fr");
    const bot = await activateBot();

    await sendMessageManagement("[Let's get back to work]");

    while (1) {
      if (moment().hours() >= 22 && moment().hours() <= 24) {
        await sendMessageManagement("Good night");
        await sleepHours(8);
        await sendMessageManagement("[Let's get back to work]");
      }
      try {
        browser = await startBrowser().catch((e) => {
          log(["start Browser: ", e]);
          return undefined;
        });
        if (!browser) continue;
        let page = await loginLaVague(browser);
        process.env.program_status = "CHECKING";
        let ready = true;
        for (let i = 0; i < sports.length; i++) {
          if (sports[i].ready) continue;
          if (await checkSport(page, sports[i])) {
            await sendMessage("[LA VAGUE] Maman tu peux réserver ton sport !");
            // await sleepHours(4 * 24);
          }
          if (!sports[i].ready) ready = false;
        }

        if (ready) {
          setUpInteractions(bot, sports);
        }
        log("Everything went well");
        if (!page.isClosed) await page.close();
      } catch (err) {
        console.log(now(), err);
      }

      await sleep(10000);
      try {
        if (browser) await browser?.close();
      } catch (e) {
        log(["error while closing: ", e]);
      }
      const time_to_sleep = sports[0].lastValue === 2 ? 1 : 120;
      await sleepMinutes(time_to_sleep);
    }
  } catch (e) {}
}

main()
  .catch((e) => console.log("error: " + e))
  .finally(async () => {});
