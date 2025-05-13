import { Elysia, t } from "elysia";
import { uploadFile, uploadText } from "./controller";

const app = new Elysia()
  .post("/upload-file", ({ body }) => uploadFile(body), {
    body: t.Object({ file: t.File() }),
  })
  .post("/upload-text", ({ body }) => uploadText(body), {
    body: t.Object({ email: t.String() }),
  })
  .onError(({ error, code }) => {
    console.error("Error:", error);
    if (code === "VALIDATION") {
      return new Response("Invalid data", { status: 400 });
    }
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error || "An unexpected error occurred",
      })
    );
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
