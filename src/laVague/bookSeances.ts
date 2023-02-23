import { Page } from "puppeteer";
import { CONFIRM_BOOK_URL } from "../data/constants";
import { sendMessage, sendMessageManagement } from "../telegram/telegramBot";
import { ISport } from "../types/types";
import { log } from "../utils";

export async function bookASeance(page: Page, sport: ISport, i: number) {
  await page.waitForNetworkIdle({ timeout: 0 });
  await page.goto(sport.next_period.url!, {
    timeout: 0,
  });
  await page.waitForNetworkIdle({ timeout: 0 });

  const buttons = await page.$$("table tbody tr td table tbody tr td img");

  await buttons[2 + i * 3].click();

  const prenom = await page.waitForSelector('input[name="prenom"]', {
    timeout: 0,
  });
  await prenom?.type(process.env.PRENOM!);
  const nom = await page.waitForSelector('input[id="nom"]', {
    timeout: 0,
  });
  await nom?.type(process.env.NOM!);
  const validate = await page.waitForSelector(
    'input[value="Je valide ma réservation"]',
    {
      timeout: 0,
    }
  );
  await validate?.click();
  await page.waitForNetworkIdle({ timeout: 0 });
  const result = await page.goto(CONFIRM_BOOK_URL, { timeout: 0 });
  await page.waitForNetworkIdle({ timeout: 0 });
  if (result?.status) console.log(result.status());
  return result?.status();
}

export async function bookSeances(page: Page, sport: ISport) {
  if (sport.next_period.seances === undefined) {
    sendMessageManagement("Sport ready but no seances found");
    return;
  }
  const seances = sport.next_period.seances;
  const indexes: number[] = [];
  sport.creneaux.forEach((creneau) => {
    seances.forEach((seance, i) => {
      if (
        seance.date.includes(creneau.day) &&
        seance.plage.includes(creneau.begin_hour) &&
        seance.booked === false
      ) {
        if (seance.available === true) indexes.push(i);
        else
          sendMessage(
            `Il n'y a plus de place pour ${sport.name} le ${seance.date} à ${seance.plage}`
          );
      }
    });
  });
  for (let i = 0; i < indexes.length; i++) {
    log(["Let's book a seance", seances[indexes[i]]]);
    const status = await bookASeance(page, sport, indexes[i]);
    log(["status", status]);
    if (status === 200) {
      seances[indexes[i]].booked = true;
      sendMessage(
        `J'ai réservé une séance de ${sport.name} le ${
          seances[indexes[i]].date
        } à ${seances[indexes[i]].plage}`
      );
    } else {
      sendMessage(
        `J'ai eu un probléme en réservant: ${sport.name} le ${
          seances[indexes[i]].date
        } à ${seances[indexes[i]].plage}`
      );
    }
  }
}
