import { spawn } from "child_process";
import path from "path";
import { status } from "elysia";
import { parseEmail } from "./helpers";

export function uploadFile(body: { file: File }) {
  console.log(body);

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
    return status(400, "No file provided");
  }

  if (body.file.type !== "text/plain;charset=utf-8") {
    throw new Error("File is not a .txt file");
  }

  // Extract the content of the file
  const reader = body.file.stream().getReader();
  let fileContent = "";

  return new Promise((resolve, reject) => {
    reader.read().then(function processText({ done, value }) {
      if (done) {
        try {
          const email = parseEmail(fileContent);

          console.log(email);

          if (!email) {
            return status(400, "Invalid email format");
          }

          if (Object.values(email).some((value) => value === "")) {
            console.log("Invalid email format");

            reject("Upload a valid email format");
          }

          // Pass the file content to the Python script
          const python = spawn("python3", ["detect.py"], {
            cwd: path.resolve(__dirname, "../model"),
          });

          python.stdin.write(JSON.stringify(email));
          python.stdin.end();

          python.stdout.on("data", (data) => {
            console.log(`Result: ${data.toString()}`);
            resolve(data.toString());
          });

          python.stderr.on("data", (data) => {
            console.error(`Error: ${data.toString()}`);
            reject(data.toString());
          });
        } catch (error) {
          console.error("Error parsing email:", error);
          reject("Internal server error");
        }

        return;
      }

      fileContent += new TextDecoder().decode(value);
      reader.read().then(processText);
    });
  });
}

export function uploadText(body: { email: string }) {
  return new Promise((resolve, reject) => {
    if (!body.email) {
      return reject("No email provided");
    }

    try {
      const email = parseEmail(body.email);

      console.log(email);

      if (Object.values(email).some((value) => value === "")) {
        console.log("Invalid email format");

        reject("Upload a valid email format");
      }

      // Pass the file content to the Python script
      const python = spawn("python3", ["detect.py"], {
        cwd: path.resolve(__dirname, "../model"),
      });

      python.stdin.write(JSON.stringify(email));
      python.stdin.end();

      python.stdout.on("data", (data) => {
        console.log(`Result: ${data.toString()}`);
        resolve(data.toString());
      });

      python.stderr.on("data", (data) => {
        console.error(`Error: ${data.toString()}`);
        reject(data.toString());
      });
    } catch (error) {
      console.error("Error parsing email:", error);
      reject("Internal server error");
    }
  });
}
