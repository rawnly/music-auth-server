declare global {
  interface ObjectConstructor {
    keys<T extends object>(obj: T): (keyof T)[];
  }
}

export type Env = ReturnType<typeof getEnv>;
export function getEnv() {
  const env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PRODUCTION_DOMAIN: process.env.PRODUCTION_DOMAIN!,
    HOST: process.env.HOST,
    PORT: process.env.PORT,

    // pkcs8
    PRIVATE_KEY: process.env.PRIVATE_KEY!,
    KID: process.env.KID!,

    // apple developer team id
    APPLE_DEVELOPER_TEAM_ID: process.env.APPLE_DEVELOPER_TEAM_ID!,

    // needed to auto-open the raycast extension once the process is completed
    EXTENSION_DEEPLINK: process.env.EXTENSION_DEEPLINK!,
  } as const;

  const optionalKeys = ["HOST", "PORT", "NODE_ENV"];

  if (env.NODE_ENV !== "production") {
    optionalKeys.push("PRODUCTION_DOMAIN");
  }

  const missingKeys = Object.keys(env).filter(
    (key) => optionalKeys.indexOf(key) === -1 && !env[key],
  );

  for (const key of missingKeys) {
    throw new Error(
      `Missing required environment variable: ${key} value=${env[key]}`,
    );
  }

  return env;
}
