import moment from "moment";

export function log(messages: any[] | string) {
  console.log("[" + moment().format() + "] ", ...messages);
}
