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
import { end, launchWatsapp } from "./whatsapp";
import { send } from "./whatsappSend";
import openWhatsapp from "./whatsapp/openWhatsappPage";
import WAWebJS, { MessageMedia } from "whatsapp-web.js";

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
    lastValue: 5,
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
  await sleep(2000);
  console.log("About to connect");
  await page.evaluate(() => {
    const elements = document.getElementsByTagName("input");
    elements[1].value = "s.dupont@imperialnegoce.fr";
    elements[2].value = "Sd150266";
    elements[3].click();
  });
  await sleep(2000);

  await page.goto(BOOK_URL, {
    timeout: 0,
  });
  await sleep(2000);

  await page.evaluate(() => {
    const divs = document.getElementsByTagName("div");
    console.log(divs);
    divs[17].click();
  });
  await page.evaluate(() => {
    const inputs = document.getElementsByTagName("input");
    inputs[1].click();
    console.log(inputs);
  });
  return page;
}

async function sendMessage(msg: string) {
  const { browser, page } = await launchWatsapp();
  // const phones = ["33614464693"];
  const phones = ["33763140355"];

  await send(page, phones, msg);
  console.log("going to end");
  // await end(browser);
  await sleep(100000);
  browser.close();
}

async function checkSport(page: Page, sport: ISport) {
  try {
    let doSleep = true;
    console.log("Let's check " + sport.name);
    await sleep(2000);
    await page.goto(sport.url, {
      timeout: 0,
    });
    await sleep(1000);

    const selector = await page.waitForSelector("#liste_periodes");
    let length = await selector?.evaluate((el) => {
      return el.children.length;
    });

    if (length === undefined) length = 0;
    console.log("There are ", length, "slots");
    if (length > sport.lastValue) {
      sport.lastValue = length;
      return true;
    } else console.log("Nothing to do here");

    sport.lastValue = length;
    if (doSleep) await sleep(2000);
  } catch (err) {
    throw err;
  }
}

async function main() {
  const whatsapp = await openWhatsapp();
  const [maman] = (await whatsapp.getContacts()).filter(
    (contact) =>
      contact.number ==
      // "33763140355"
      "33614464693"
  );
  const sportIMG = MessageMedia.fromFilePath("assets/sport.gif");
  const chat = await maman.getChat();
  await chat.sendMessage(sportIMG);
  await chat.sendMessage("ceci est un test");
  while (1) {
    try {
      console.log("Launching web");
      browser = await startBrowser();
      let page = await login();
      for (let i = 0; i < sports.length; i++) {
        if (await checkSport(page, sports[i])) {
          chat.sendMessage("Maman tu peux réserver ton sport !");
          chat.sendMessage(sportIMG);
        }
      }
      console.log("everything went well");
    } catch (err) {
      console.log(now(), err);
      continue;
    }
    await sleep(60000);

    await browser?.close();
    console.log("Time to sleep 2 minutes");
    await sleep(10000);
  }
}

main()
  .catch((e) => console.log("error: " + e))
  .finally(async () => {
    //await browser?.close();
  });
