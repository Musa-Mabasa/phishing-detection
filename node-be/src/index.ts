import { Elysia, t } from "elysia";
import { uploadFile, uploadText } from "./controller";

const app = new Elysia()
  .get("/upload-file", ({ body }) => uploadFile(body), {
    body: t.Object({ file: t.File() }),
  })
  .get("/upload-text", ({ body }) => uploadText(body), {
    body: t.Object({ email: t.String() }),
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
