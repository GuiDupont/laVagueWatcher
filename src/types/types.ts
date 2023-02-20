interface ISport {
  url: string;
  lastValue: number;
  name: string;
  tarif: string;
  id: number;
  next_period: IPeriod;
  ready: boolean;
  niveau: number;
  creneaux: ICreneaux[];
}

interface ISeance {
  date: string;
  plage: string;
  available: boolean;
  booked: boolean;
  hash?: string;
}

interface ICreneaux {
  day: string;
  begin_hour: string;
}

interface IPeriod {
  begin_end: string;
  period_id: string;
  url?: string;
  seances?: ISeance[];
}

export { ISport, IPeriod, ISeance };
