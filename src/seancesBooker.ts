import { Page, PuppeteerNode } from "puppeteer";
import { sports } from "./data/sports";
import { sendMessage } from "./telegram/telegramBot";
import { bookASeance, getIndexes } from "./laVague/bookSeances";
import { prepareNextPeriod } from "./laVague/watcher";
import { ISeance, ISport } from "./types/types";
const puppeteer: PuppeteerNode = require("puppeteer");

export class seancesBooker {
  page: Page;
  sports: ISport[];
  isOver: boolean = false;
  constructor(page: Page, sports: ISport[]) {
    this.page = page;
    this.sports = sports;
  }

  async sendSuccessMessage(sport: ISport, seances: ISeance[], index: number) {
    sendMessage(
      `J'ai réservé une séance de ${sport.name} le ${seances[index].date} à ${seances[index].plage}`
    );
  }

  async sendFailureMessage(sport: ISport, seances: ISeance[], index: number) {
    sendMessage(
      `J'ai eu un probléme en réservant: ${sport.name} le ${seances[index].date} à ${seances[index].plage}`
    );
  }

  private checkIfBookingIsOverForOneSport(sport: ISport) {
    const seances = sport.next_period.seances!;
    for (let i = 0; i < sport.next_period.wantedSeancesIndexes!.length; i++) {
      const index = sport.next_period.wantedSeancesIndexes![i];
      if (seances[index].booked === false) return false;
    }
    return true;
  }

  checkIfBookingIsOverForAllSports() {
    this.isOver = true;
    for (let i = 0; i < this.sports.length; i++) {
      this.isOver = this.checkIfBookingIsOverForOneSport(this.sports[i]);
      if (this.isOver === false) break;
    }
  }

  async bookSeances(sport: ISport) {
    const seances = sport.next_period.seances!;
    const indexes = (sport.next_period.wantedSeancesIndexes =
      getIndexes(sport));

    for (let i = 0; i < indexes.length; i++) {
      if (seances[indexes[i]].booked === true) continue;
      await bookASeance(this.page, sport, indexes[i]);
      if ((seances[indexes[i]].booked = true))
        this.sendSuccessMessage(sport, seances, indexes[i]);
      else {
        this.sendFailureMessage(sport, seances, indexes[i]);
      }
    }
  }

  async bookSportsReady() {
    for (let i = 0; i < this.sports.length; i++) {
      if (sports[i].ready && !sports[i].booked) {
        if (sports[i].next_period.seances?.length === 0)
          await prepareNextPeriod(this.page, sports[i]);
        if (sports[i].next_period.seances?.length !== 0)
          await this.bookSeances(sports[i]);
      }
    }
  }
}
