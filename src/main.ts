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
import { sleep } from "./utils";
// import * as wbm from "./api";
import { now } from "moment";
import openWhatsapp from "./whatsapp/openWhatsappPage";
import WAWebJS, { MessageMedia } from "whatsapp-web.js";
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

  console.log("[" + moment().format() + "] ", "I am in ", BASE_URL);
  await sleep(3000);
  console.log("[" + moment().format() + "] ", "About to connect");
  await page.evaluate(() => {
    const elements = document.getElementsByTagName("input");
    elements[1].value = "s.dupont@imperialnegoce.fr";
    elements[2].value = "Sd150266";
    elements[3].click();
  });
  page.waitForNavigation({ timeout: 0 });

  await sleep(3000);
  console.log("[" + moment().format() + "] ", "About to go to book_url");

  await page.goto(BOOK_URL, {
    timeout: 0,
  });
  await sleep(3000);

  console.log("[" + moment().format() + "] ", "Going to get div");
  await page.evaluate(() => {
    const divs = document.getElementsByTagName("div");
    divs[17].click();
  });
  page.waitForNavigation({ timeout: 0 });
  console.log("[" + moment().format() + "] ", "Going to get input");
  await sleep(3000);

  await page.evaluate(() => {
    const inputs = document.getElementsByTagName("input");
    inputs[1].click();
  });
  page.waitForNavigation({ timeout: 0 });

  await sleep(3000);
  console.log(
    "[" + moment().format() + "] ",
    "Going to return page, I am connected"
  );

  return page;
}

async function checkSport(page: Page, sport: ISport) {
  try {
    console.log("[" + moment().format() + "] ", "Let's check " + sport.name);
    await sleep(2000);
    await page.goto(sport.url, {
      timeout: 0,
    });
    await sleep(1000);

    const selector = await page.waitForSelector("#liste_periodes");
    let length = await selector?.evaluate((el) => {
      return el.children.length;
    });

    console.log(
      "[" + moment().format() + "] ",
      "There are ",
      length,
      "slots",
      "last value is",
      sport.lastValue
    );
    if (length === undefined) length = sport.lastValue;
    if (length > sport.lastValue) {
      sport.lastValue = length;
      return true;
    } else console.log("[" + moment().format() + "] ", "Nothing to do here");

    sport.lastValue = length;
    await sleep(2 * 1000);
  } catch (err) {
    throw err;
  }
}

async function main() {
  const whatsapp = await openWhatsapp(true);
  const [maman] = (await whatsapp.getContacts()).filter(
    (contact) => contact.number == "33614464693"
  );
  const sportIMG = MessageMedia.fromFilePath("assets/sport.jpeg");
  const chat = await maman.getChat();
  while (1) {
    try {
      browser = await startBrowser();
      let page = await login();
      for (let i = 0; i < sports.length; i++) {
        if (await checkSport(page, sports[i])) {
          console.log("[" + moment().format() + "] ", "New slot identified !");

          chat.sendMessage("Maman tu peux réserver ton sport !");
          chat.sendMessage(sportIMG);
        }
      }
      console.log("[" + moment().format() + "] ", "everything went well");
    } catch (err) {
      console.log("[" + moment().format() + "] ", "issue in the process");
      console.log(now(), err);
      continue;
    }
    await sleep(10000);
    try {
      await browser?.close();
    } catch (e) {
      console.log("[" + moment().format() + "] ", "error while closing: ", e);
    }
    console.log("[" + moment().format() + "] ", "Time to sleep 10 minutes");
    await sleep(10 * 60 * 1000);
  }
}

main()
  .catch((e) => console.log("error: " + e))
  .finally(async () => {
    // await browser?.close();
  });
