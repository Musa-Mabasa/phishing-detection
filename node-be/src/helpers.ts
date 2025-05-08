import { Email } from "./model";

export function parseEmail(rawEmail: string): Email {
  const lines = rawEmail.split("\n").map((line) => line.trim());

  let sender = "";
  let receiver = "";
  let date = "";
  let subject = "";
  let bodyLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (i === 0) {
      subject = line;
    } else if (!sender && line.match(/.+<.+@.+>/)) {
      sender = line;
    } else if (
      (!date &&
        line.match(
          /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s\d{1,2}\s\w+,\s\d{2}:\d{2}/
        )) ||
      line.match(
        /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} [-+]\d{4}$/
      )
    ) {
      // e.g., Sun 23 Mar, 13:10
      date = line;
    } else if (
      line.toLowerCase().startsWith("to ") ||
      line.toLowerCase() === "to me"
    ) {
      receiver = line.replace(/^to /i, "").trim();
    } else if (sender && date && subject && receiver && line !== "") {
      // Remaining non-empty lines are body
      bodyLines = lines.slice(i);
      break;
    }
  }

  const body = bodyLines.join("\n");
  const urls =
    /http[s]?:\/\/|update your payment|click here|support article/i.test(body)
      ? 1
      : 0;

  return {
    sender,
    receiver,
    date,
    subject,
    body,
    urls,
  };
}
