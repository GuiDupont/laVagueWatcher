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
import { sleep, sleepHours } from "./utils";
// import * as wbm from "./api";
import { now } from "moment";
import openWhatsapp from "./whatsapp/openWhatsappPage";
import WAWebJS, { MessageMedia } from "whatsapp-web.js";
import { log } from "./logging";
import moment from "moment";

let browser: Browser | undefined;

interface ISport {
  url: string;
  lastValue: number;
  name: string;
}
const sports = [
  {
    url: RPM_URL,
    name: "RPM",
    lastValue: Number.MAX_SAFE_INTEGER,
  },
];

async function login() {
  let page: Page;

  page = await browser!.newPage();
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
  await sleep(3000);
  log(["About to connect"]);
  await page.evaluate(() => {
    const elements = document.getElementsByTagName("input");
    elements[1].value = "s.dupont@imperialnegoce.fr";
    elements[2].value = "Sd150266";
    elements[3].click();
  });
  page.waitForNavigation({ timeout: 0 });

  await sleep(3000);
  log(["About to go to book_url"]);

  await page.goto(BOOK_URL, {
    timeout: 0,
  });
  await sleep(3000);

  log(["Going to get div"]);
  await page.evaluate(() => {
    const divs = document.getElementsByTagName("div");
    divs[17].click();
  });
  page.waitForNavigation({ timeout: 0 });
  log(["Going to get input"]);
  await sleep(3000);

  await page.evaluate(() => {
    const inputs = document.getElementsByTagName("input");
    inputs[1].click();
  });
  page.waitForNavigation({ timeout: 0 });

  await sleep(3000);
  log(["Going to return page, I am connected"]);

  return page;
}

async function checkSport(page: Page, sport: ISport) {
  try {
    log(["Let's check " + sport.name]);
    await sleep(2000);
    const res = await page.goto(sport.url, {
      timeout: 0,
    });
    log([res]);
    await sleep(1000);
    log(["After goto"]);

    const selector = await page.waitForSelector("#liste_periode", {
      timeout: 2,
    });
    log(["Selector received"]);

    let length = await selector?.evaluate((el) => {
      return el.children.length;
    });

    log([
      "There are " + length + " slots " + " last value is " + sport.lastValue,
    ]);
    if (length === undefined) length = sport.lastValue;
    if (length > sport.lastValue) {
      sport.lastValue = length;
      return true;
    } else log(["Nothing to do here"]);

    sport.lastValue = length;
    await sleep(2 * 1000);
  } catch (err) {
    throw err;
  }
}

async function main() {
  try {
    log(["Let's go"]);
    moment.locale("fr");
    const whatsapp = await openWhatsapp(true);
    const [lifeCheck] = (await whatsapp.getChats()).filter(
      (info) => info.name === "liveCheck"
    );

    await lifeCheck.sendMessage(
      moment().format("[Let's get back to work] dddd Do")
    );

    const [maman] = (await whatsapp.getContacts()).filter(
      (contact) => contact.number == "33614464693"
    );
    const sportIMG = MessageMedia.fromFilePath("assets/sport.jpeg");
    const chat = await maman.getChat();

    while (1) {
      if (moment().hours() >= 22) {
        log(["Time to sleep 8 hours"]);
        await sleepHours(8);
        await lifeCheck.sendMessage(
          moment().format("[Let's get back to work] dddd Do")
        );
      }
      try {
        browser = await startBrowser();
        let page = await login();
        for (let i = 0; i < sports.length; i++) {
          if (await checkSport(page, sports[i])) {
            log(["New slot identified !"]);
            await chat.sendMessage("Maman tu peux réserver ton sport !");
            await chat.sendMessage(sportIMG);
            log(["Time to sleep 2 days"]);
            await sleepHours(3 * 24);
          }
        }
        log(["everything went well"]);
      } catch (err) {
        log(["issue in the process"]);
        console.log(now(), err);
      }
      await sleep(10000);
      try {
        await browser?.close();
      } catch (e) {
        log(["error while closing: ", e]);
      }
      const time_to_sleep = sports[0].lastValue === 2 ? 10 : 60;
      log([
        `Time to sleep ${time_to_sleep} minutes cause ${sports[0].lastValue}`,
      ]);
      await sleep(time_to_sleep * 60 * 1000);
    }
  } catch (e) {}
}

main()
  .catch((e) => console.log("error: " + e))
  .finally(async () => {
    // await browser?.close();
  });
