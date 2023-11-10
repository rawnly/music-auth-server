import fastify from "fastify";
import fs from "node:fs";
import path from "path";
import fastifyStatic from "@fastify/static";
import dotenv from "dotenv";
import { generateToken } from "./utils/token";
import { getEnv } from "./utils/env";

const server = fastify({ logger: true });

try {
  dotenv.config();
  console.debug("Loaded .env file");
} catch (error) {
  console.warn(`Failed to load .env file: ${(error as Error).message}`);
}

try {
  getEnv();
} catch (error) {
  console.error(error);
  process.exit(1);
}

const PORT = parseInt(process.env.port || "5000");
const HOST = process.env.host || "0.0.0.0";
const isDev = process.env.NODE_ENV !== "production";

const publicDir = path.resolve(__dirname, "..", "public");

const contentSecurityPolicy: Record<string, string> = {
  "default-src": "none",
  "base-uri": "self",
  "object-src": "none",
  "form-action": "none",
  "frame-ancestors": "none",
  "require-trusted-types-for": "script",
};

function contentSecurityPolicyHeader(policy: Record<string, string>) {
  return Object.entries(policy)
    .map(([key, value]) => `${key} '${value}'`)
    .join("; ");
}

server.register(fastifyStatic, {
  root: publicDir,
  prefix: "/public/",
});

server.addHook("onRequest", (req, res, done) => {
  if (isDev) {
    done();
    return;
  }

  // redirect to https
  if (req.headers["x-forwarded-proto"] !== "https") {
    console.warn("redirecting to https");
    res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
    return;
  }

  res.header(
    "Strict-Transport-Security",
    "max-age=31536000, includeSubDomains",
  );
  res.header(
    "Content-Security-Policy",
    contentSecurityPolicyHeader(contentSecurityPolicy),
  );
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Referrer-Policy", "no-referrer");

  done();
});

server.get("/api/get-token", async (req, res) => {
  try {
    const token = await generateToken(HOST, PORT);
    return res.send(token);
  } catch (error) {
    server.log.error(error);
    return res.status(500).send({ error: (error as Error).message });
  }
});

server.get("/", async (req, res) => {
  res.header("Content-Type", "text/html");
  const token = await generateToken(HOST, PORT);

  const script = fs.readFileSync(path.resolve(publicDir, "index.js"), "utf-8");
  const template = fs.readFileSync(
    path.resolve(publicDir, "index.html"),
    "utf-8",
  );
  const style = fs.readFileSync(path.resolve(publicDir, "index.css"), "utf-8");

  return res.send(
    template
      .replace(
        "{{SCRIPT}}",
        script
          .replace("{{DEVELOPER_TOKEN}}", token.token)
          .replace("{{TOKEN_EXPIRES_AT}", token.expirationTime.toString()),
      )
      .replace("{{CSS}}", style),
  );
});

(async function start() {
  try {
    await server.listen({ port: PORT, host: HOST });
  } catch (error) {
    console.error(error);
    server.log.error(error);
    process.exit(1);
  }
})();
