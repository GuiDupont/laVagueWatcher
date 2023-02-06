import { Telegraf } from "telegraf";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

export async function sendMessageManagement(message: string) {
  const bot = new Telegraf(process.env.CONV_TOKEN!);
  bot.telegram.sendMessage(process.env.CONV_ID_MANAGEMENT!, message);
}

export async function sendMessage(message: string) {
  const bot = new Telegraf(process.env.CONV_TOKEN!);
  bot.telegram.sendMessage(process.env.CONV_ID!, message);
}

export async function activateBot() {
  // const bot = new Telegraf("5889142238:AAGWaP4SOoaMxnocRKTb0ztbemYliIUpdro");
  const bot = new Telegraf(process.env.CONV_TOKEN!);

  bot.command("/ok", async (ctx) => {
    ctx.reply(`ok`);
  });

  bot.command("/conv_id", (ctx) => ctx.reply(ctx.chat.id.toString()));

  bot.launch();
  return bot;
}
