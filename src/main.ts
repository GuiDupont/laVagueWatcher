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
import { sleep, sleepHours, sleepMinutes, sleepSeconds } from "./utils";
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
import { checkSport, loginLaVague } from "./watcher";
import { sports } from "./sports";

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
          await checkSport(page, sports[i]);
          if (!sports[i].ready) ready = false;
        }

        setUpInteractions(bot, sports);

        if (ready) {
          await sendMessage(
            "[LA VAGUE] Maman tu peux réserver tes séances de /sports !"
          );
          if (!page.isClosed) await page.close();
          if (browser) await browser?.close();
          await sleepHours(4 * 24);
        }
        log("Everything went well");
        if (!page.isClosed) await page.close();
      } catch (err: any) {
        log([(err as Error).message]);
        await sleepSeconds(30);
        continue;
      }

      try {
        if (browser) await browser?.close();
      } catch (e) {
        log(["error while closing: ", e]);
      }

      let time_to_sleep = 120;
      let oneSportIsNotReady = false;
      let oneSportIsReady = false;
      sports.forEach((sport) => {
        if (sport.ready) oneSportIsReady = true;
        else oneSportIsNotReady = true;
      });
      if (oneSportIsReady && oneSportIsNotReady) time_to_sleep = 1;
      await sleepMinutes(time_to_sleep);
    }
  } catch (e) {}
}

main()
  .catch((e) => console.log("error: " + e))
  .finally(async () => {});
