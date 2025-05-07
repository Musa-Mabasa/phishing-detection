import { spawn } from "child_process";
import path from "path";

export function uploadFile() {
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

  try {
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
  } catch (error) {
    console.error("Error:", error);
    return "file upload error";
  }
}

export function uploadText() {
  return "text upload";
}
