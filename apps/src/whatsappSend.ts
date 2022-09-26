import { Page } from "puppeteer";
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
    await page.waitForSelector(SELECTORS.LOADING, {
      hidden: true,
      timeout: 60000,
    });
    await page.waitForSelector(SELECTORS.SEND_BUTTON, { timeout: 5000 });
    await page.keyboard.press("Enter");
    // await page.w(1000);
    // process.stdout.clearLine();
    // process.stdout.cursorTo(0);
    process.stdout.write(`${phone} Sent\n`);
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
