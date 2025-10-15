import "dotenv/config";
import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import nunjucks from "nunjucks";
import { logger } from "./middlewares/loggerMiddleware";
import { randomUUID } from "node:crypto";
import * as path from "node:path";
import { createFile, readThisFile, deleteFile } from "./fs/fsCRUDOperations";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const nunEnv = nunjucks.configure("src/templates", {
  autoescape: true,
  express: app,
});

app.get("/", (req: Request, res: Response) => {
  res.render("index.html", {
    title: "Home Page",
  });
});

app.post("/secret", async (req: Request, res: Response) => {
  const secret = req?.body?.secret;
  const id = encodeURI(randomUUID());
  const generatedLink = `${req.protocol}://${req.get("host")}/secret/${id}`;
  const secretFile = createFile(
    path.join(__dirname, "..", "public", "secrets", `${id}.txt`),
    secret
  );

  // ... Secret speichern, Link generieren ...
  console.log(req.body);
  // res.render('secret_link.njk', { link: generatedLink });
  res.render("index.html", {
    id,
    generatedLink,
  });
});

app.get("/secret/:secretId", async (req: Request, res: Response) => {
  const secretId = req.params.secretId;

  if (!secretId) {
    return res.status(404).send("Secret not found!");
  }
  const filePath = path.join(
    __dirname,
    "..",
    "public",
    "secrets",
    `${secretId}.txt`
  );
  let message = await readThisFile(filePath);
  if (message === "") {
    message = "No secret found on this link";
  }
  await deleteFile(filePath);
  res.render("secret.html", {
    message,
  });
});

app.listen(PORT, () => {
  console.log(`server is Running at http://localhost:${PORT}`);
});
