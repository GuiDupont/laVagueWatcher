import { Browser } from "puppeteer";
import startBrowser from "./browser/startBrowser";
import { log, sleepHours, sleepMinutes, sleepSeconds } from "./utils";
import moment from "moment";
import { activateBot, sendMessageManagement } from "./telegram/telegramBot";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { checkSport, prepareNextPeriod } from "./laVague/watcher";
import { sports } from "./sports";
import { loginLaVague } from "./laVague/login";
import { bookSeances } from "./laVague/bookSeances";
import { timeToSleep } from "./laVague/timeToSleep";

dotenv.config();

let browser: Browser | undefined;

process.env.program_status = "SETTING UP";

async function main() {
  try {
    moment.locale("fr");
    const bot = await activateBot();
    if (process.platform !== "darwin")
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
          if (sports[i].ready) {
            await prepareNextPeriod(page, sports[i]);
            await bookSeances(page, sports[i]);
          } else ready = false;
        }

        // setUpInteractions(bot, sports);

        if (ready) {
          if (!page.isClosed) await page.close();
          if (browser) await browser?.close();
          await sleepHours(4 * 24);
          sports.forEach((s) => (s.ready = false));
        }
        log("Everything went well");
        if (!page.isClosed) await page.close();
      } catch (err: any) {
        log([(err as Error).message]);
        await sleepSeconds(60);
        continue;
      }

      try {
        if (browser) await browser?.close();
      } catch (e) {
        log(["error while closing: ", e]);
      }

      await sleepMinutes(timeToSleep(sports));
    }
  } catch (e) {}
}

main()
  .catch((e) => console.log("error: " + e))
  .finally(async () => {});
