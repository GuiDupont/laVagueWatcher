import { Browser, Page } from 'puppeteer';
import {
  BASE_URL,
  BODYCOMBAT_URL,
  BOOK_URL,
  RPM_URL,
  ZUMBA_URL,
  CAF_URL,
  CT_URL,
} from './constants';
import startBrowser from './startBrowser';
import { sleep } from './utils';
import * as wbm from './api';
import { now } from 'moment';

let browser: Browser | undefined;

interface ISport {
  url: string;
  lastValue: number;
  name: string;
}
const sports = [
  // {
  //   url: BODYCOMBAT_URL,
  //   name: 'Bodycombat',
  //   lastValue: 5,
  // },
  {
    url: RPM_URL,
    name: 'RPM',
    lastValue: 5,
  },
  // {
  //   url: ZUMBA_URL,
  //   name: 'ZUMBA',
  //   lastValue: 5,
  // },
  // {
  //   url: CAF_URL,
  //   name: 'CAF',
  //   lastValue: 5,
  // },
  // {
  //   url: CT_URL,
  //   name: 'CT',
  //   lastValue: 5,
  // },
];

async function launchWatsapp() {
  console.log('Launching whatsapp');
  await wbm.start({ showBrowser: false, qrCodeData: true, session: true });
  await wbm.waitQRCode();
  console.log('Whatsapp is good');
  await wbm.end();
}

async function sendMessage(msg: string) {
  await launchWatsapp();
  const phones = ['33614464693'];
  await wbm.send(phones, msg);
  
  await sleep(4000);
  await wbm.end();
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

    const selector = await page.waitForSelector('#liste_periodes');
    let length = await selector?.evaluate((el) => {
      return el.children.length;
    });

    if (length === undefined) length = 0;
    console.log("There are ", length, "slots");
    if (length > sport.lastValue) {
      await sendMessage(
        'Coucou Maman, tu peux booker ton cours de ' + sport.name,
      );
      doSleep = false;
    }
    sport.lastValue = length;
    if (doSleep) await sleep(2000);
  } catch (err) {
    throw err;
  }
}



async function main() {
  await sendMessage("let's go");
  while (1) {
    try {
      console.log('Launching web');
      browser = await startBrowser();
      let page: Page;
      
      page = await browser!.newPage();
      page.on('load', () => {
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
      console.log('About to connect');
      await page.evaluate(() => {
        const elements = document.getElementsByTagName('input');
        elements[1].value = 's.dupont@imperialnegoce.fr';
        elements[2].value = 'Sd150266';
        elements[3].click();
      });
    await sleep(2000);

      await page.goto(BOOK_URL, {
        timeout: 0,
      });
    await sleep(2000);

      await page.evaluate(() => {
        const divs = document.getElementsByTagName('div');
        console.log(divs);
        divs[17].click();
      });
      await page.evaluate(() => {
        const inputs = document.getElementsByTagName('input');
        inputs[1].click();
        console.log(inputs);
      });
      for (let i = 0; i < sports.length; i++) {
        await checkSport(page, sports[i]);
      } 
      console.log("everything went well")
  } catch (err) {
      console.log(now(), err);
      continue;
    }
    await browser?.close();
    console.log("Time to sleep 5 minutes")
    await sleep(300000);

  }

}

main()
  .catch((e) => console.log('error: ' + e.message))
  .finally(async () => {
    //await browser?.close();
  });
