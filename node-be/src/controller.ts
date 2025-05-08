import { spawn } from "child_process";
import path from "path";
import * as elysia from "elysia";

export function uploadFile(body: { file: File }) {
  const email = {
    sender: "Linwood Sloan <Linwood@goline.ca>",
    receiver: "user7-ext4@gvc.ceas-challenge.cc",
    date: "Tue, 05 Aug 2008 20:27:34 -0300",
    subject: "Your order",
    body: `Britney spears p0rn video, Jennifer Lopez pictures ... 
http://somateco.com.br/folderz/ready.php
`,
    urls: 1,
  };
  if (!body.file) {
    throw new Error("No file provided");
  }

  if (body.file.type !== "text/plain") {
    throw new Error("File is not a .txt file");
  }

  const python = spawn("python3", ["detect.py"], {
    cwd: path.resolve(__dirname, "../model"),
  });

  python.stdin.write(JSON.stringify(email));
  python.stdin.end();

  python.stdout.on("data", (data) => {
    console.log(`Result: ${data.toString()}`);
  });

  python.stderr.on("data", (data) => {
    console.error(`Error: ${data.toString()}`);
  });
  return "file upload";
}

export function uploadText(body: { email: string }) {
  return "text upload";
}
