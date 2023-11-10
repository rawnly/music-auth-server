import * as jose from "jose";
import { getEnv } from "./env";
import ms from "ms";

export async function generateToken(host?: string, port?: number) {
  const env = getEnv();

  const alg = "ES256";
  const pkcs8 = atob(env.PRIVATE_KEY);
  const privateKey = await jose.importPKCS8(pkcs8, alg);
  const expirationTime = Date.now() + ms("20m");

  const jwt = new jose.SignJWT({
    origin: [
      "https://raycast-music.local",
      env.PRODUCTION_DOMAIN,
      ...(env.NODE_ENV === "development" && host && port
        ? [`http://${host}:${port}`, `https://${host}:${port}`]
        : []),
    ].filter(Boolean),
  })
    .setProtectedHeader({ alg, kid: env.KID })
    .setIssuedAt()
    .setIssuer(env.APPLE_DEVELOPER_TEAM_ID)
    .setExpirationTime(expirationTime);

  const token = await jwt.sign(privateKey);

  return {
    token,
    expirationTime,
  };
}
