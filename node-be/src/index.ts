import { Elysia } from "elysia";
import { uploadFile, uploadText } from "./controller";

const app = new Elysia()
  .get("/upload-file", () => uploadFile())
  .get("/upload-text", () => uploadText())
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
