export interface AppConfig {
  readonly nodeEnv: "development" | "production" | "test";
  readonly port: number;
  /** Origin used when composing short URLs, e.g. http://localhost:4000 */
  readonly baseUrl: string;
}

const VALID_ENVS = ["development", "production", "test"] as const;
const DEFAULT_PORT = 4000;

function parseNodeEnv(value: string | undefined): AppConfig["nodeEnv"] {
  if (value === undefined) return "development";
  if ((VALID_ENVS as readonly string[]).includes(value)) {
    return value as AppConfig["nodeEnv"];
  }
  throw new Error(
    `Invalid NODE_ENV "${value}". Expected one of: ${VALID_ENVS.join(", ")}`
  );
}

function parsePort(value: string | undefined): number {
  if (value === undefined || value === "") return DEFAULT_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(
      `Invalid PORT "${value}". Expected an integer between 0 and 65535`
    );
  }
  return port;
}

function parseBaseUrl(value: string | undefined, port: number): string {
  if (value === undefined || value === "") return `http://localhost:${port}`;
  return value.replace(/\/+$/, "");
}

const port = parsePort(process.env.PORT);

/* Named API_BASE_URL, not BASE_URL: Vite/Vitest inject BASE_URL="/" into
 * process.env, which would silently override the default under test. */
export const config: AppConfig = Object.freeze({
  nodeEnv: parseNodeEnv(process.env.NODE_ENV),
  port,
  baseUrl: parseBaseUrl(process.env.API_BASE_URL, port),
});
