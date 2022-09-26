// import * as wbm from "./api";
import * as rimraf from "rimraf";
import path from "path";
import { Browser, Page, PuppeteerNode } from "puppeteer";
import { merge, from, take } from "rxjs";
const puppeteer: PuppeteerNode = require("puppeteer");
import qrcode from "qrcode-terminal";

const tmpPath = path.resolve(__dirname, "../tmp");

export const SELECTORS = {
  LOADING: "progress",
  INSIDE_CHAT: "document.getElementsByClassName('two')[0]",
  QRCODE_PAGE: "body > div > div > .landing-wrapper",
  QRCODE_DATA: "div[data-ref]",
  QRCODE_DATA_ATTR: "data-ref",
  SEND_BUTTON: 'div:nth-child(2) > button > span[data-icon="send"]',
};

function deleteSession(tmpPath: string) {
  rimraf.sync(tmpPath);
}

function needsToScan(page: Page) {
  return from(
    page
      .waitForSelector(SELECTORS.QRCODE_PAGE, {
        timeout: 0,
      })
      .then(() => false)
  );
}

function isInsideChat(page: Page) {
  return from(
    page
      .waitForFunction(SELECTORS.INSIDE_CHAT, {
        timeout: 0,
      })
      .then(() => true)
  );
}

function isAuthenticated(page: Page) {
  console.log("Authenticating...");
  return merge(needsToScan(page), isInsideChat(page)).pipe(take(1));
}

async function getQRCodeData(page: Page) {
  await page.waitForSelector(SELECTORS.QRCODE_DATA, { timeout: 60000 });
  const qrcodeData = await page.evaluate((SELECTORS) => {
    const qrcodeDiv = document.querySelector(SELECTORS.QRCODE_DATA);
    if (qrcodeDiv === null) throw "get qr code";
    return qrcodeDiv.getAttribute(SELECTORS.QRCODE_DATA_ATTR);
  }, SELECTORS);
  return qrcodeData;
}

async function QRCodeExeption(msg: string) {
  return "QRCodeException: " + msg;
}
async function waitQRCode(page: Page) {
  // if user scan QR Code it will be hidden
  try {
    await page.waitForSelector(SELECTORS.QRCODE_PAGE, {
      timeout: 30000,
      hidden: true,
    });
  } catch (err) {
    throw await QRCodeExeption("Dont't be late to scan the QR Code.");
  }
}

async function generateQRCode(page: Page) {
  try {
    console.log("generating QRCode...");
    const qrcodeData = await getQRCodeData(page);
    if (qrcodeData === null) throw "generateQRcode";
    qrcode.generate(qrcodeData, { small: true });
    console.log("QRCode generated! Scan it using Whatsapp App.");
  } catch (err) {
    throw await QRCodeExeption(
      "QR Code can't be generated(maybe your connection is too slow)."
    );
  }
  await waitQRCode(page);
}

async function start(showBrowser = false, qrCodeData = false, session = true) {
  if (!session) {
    deleteSession(tmpPath);
  }

  const args = {
    headless: !showBrowser,
    userDataDir: tmpPath,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    // args: [
    //   "--no-sandbox",
    //   "--disable-setuid-sandbox",
    //   // "--blink-settings=imagesEnabled=false"]
    // ],
  };
  let page: Page;
  let browser: Browser;
  try {
    browser = await puppeteer.launch(args);
    console.log("before browser check");
    if (!browser) throw "!browser";
    page = await browser.newPage();
    if (!page) {
      browser.close();
      throw "!page";
    }
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );
    page.setDefaultTimeout(100000);
    await page.goto("https://web.whatsapp.com", { timeout: 0 });
    if (session && isAuthenticated(page)) {
      throw "!browser";
    } else {
      if (qrCodeData) {
        console.log("Getting QRCode data...");
        console.log(
          "Note: You should use wbm.waitQRCode() inside wbm.start() to avoid errors."
        );
        await getQRCodeData(page);
      } else {
        await generateQRCode(page);
      }
    }
  } catch (err) {
    console.log("issue opening whatsapp");
    deleteSession(tmpPath);
    console.log(err);
    throw err;
  }
  return { browser, page };
}

export async function end(browser: Browser) {
  if (browser != null) await browser.close();
  //   console.log(`Result: ${counter.success} sent, ${counter.fails} failed`);
  process.exit();
}

export async function launchWatsapp() {
  console.log("Launching whatsapp");

  const { browser, page } = await start(true, true, true);
  await waitQRCode(page);
  console.log("Whatsapp is good");
  return { browser, page };
}
