import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

async function openWhatsapp(headLess: boolean) {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: headLess,
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });
  client.on("loading_screen", (percent, message) => {
    console.log("LOADING SCREEN", percent, message);
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("QR RECEIVED", qr);
  });

  client.on("authenticated", () => {
    console.log("AUTHENTICATED");
  });

  client.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
  });

  client.on("ready", async () => {
    console.log("READY");
  });
  await client.initialize();
  return client;
}

export default openWhatsapp;