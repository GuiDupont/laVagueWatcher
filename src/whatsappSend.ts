import { Page } from "puppeteer";
import { sleep } from "./utils";
import { SELECTORS } from "./whatsapp";

let counter = { fails: 0, success: 0 };

async function sendTo(page: Page, phone: string, message: string) {
  try {
    console.log("Sending Message...\r");
    await page.goto(
      `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
        message
      )}`,
      { timeout: 0 }
    );
    console.log("GoTo okay\r");

    await page.waitForSelector(SELECTORS.LOADING, {
      hidden: true,
      timeout: 60000,
    });
    console.log("WaitFor selector 1 okay\r");

    await page.waitForSelector(SELECTORS.SEND_BUTTON, { timeout: 5000 });
    console.log("WaitFor selector 2 okay\r");

    await page.keyboard.press("Enter");
    console.log("enter okay\r");

    // await page.waitForResponse();
    // process.stdout.clearLine();
    // process.stdout.cursorTo(0);
    await sleep(10000);
    process.stdout.write(`${phone} Sent\n`);
    console.log("enter okay\r");

    counter.success++;
  } catch (err) {
    // process.stdout.clearLine();
    // process.stdout.cursorTo(0);
    process.stdout.write(`${phone} Failed\n`);
    counter.fails++;
  }
}

export async function send(
  page: Page,
  phoneOrContacts: string[],
  message: string
) {
  for (let phoneOrContact of phoneOrContacts) {
    await sendTo(page, phoneOrContact, message);
  }
}
