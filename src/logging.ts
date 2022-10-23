import moment from "moment";

export function log(messages: any[]) {
  console.log("[" + moment().format() + "] ");
  console.log("                            ");
  messages.forEach((msg) => console.log(msg));
}
