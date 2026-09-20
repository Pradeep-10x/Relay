import { Redis, type RedisOptions } from "ioredis";
import { logger } from "./logger.js";

const normalizeRedisUrl = (value?: string) => {
    if (!value) {
        throw new Error("REDIS_URL is required");
    }

    const decoded = decodeURIComponent(value.trim());
    const cliUrlMatch = decoded.match(/(?:rediss?|redis):\/\/\S+/);
    const url = cliUrlMatch?.[0] ?? decoded;

    // Managed Redis (the production target) requires TLS, so keep upgrading
    // redis:// -> rediss:// by default. Set REDIS_TLS=false for a local /
    // plaintext instance that doesn't speak TLS.
    if (process.env.REDIS_TLS === "false") {
        return url;
    }

    return url.replace(/^redis:\/\//, "rediss://");
};

const redisUrl = normalizeRedisUrl(process.env.REDIS_URL);

const redisOptions: RedisOptions = {
    lazyConnect: false,
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        return Math.min(times * 200, 2000);
    },
};

const attachRedisHandlers = (client: Redis, name: string) => {
    client.on("connect", () => {
        logger.info({ redisClient: name }, "Redis connected");
    });

    client.on("ready", () => {
        logger.info({ redisClient: name }, "Redis ready");
    });

    client.on("error", (err) => {
        logger.error({ err, redisClient: name }, "Redis error");
    });

    return client;
};

export const createRedisClient = (
    name: string,
    options: RedisOptions = {},
) => {
    return attachRedisHandlers(
        new Redis(redisUrl, {
            ...redisOptions,
            ...options,
        }),
        name,
    );
};

export const duplicateRedisClient = (
    client: Redis,
    name: string,
    options: RedisOptions = {},
) => attachRedisHandlers(
    client.duplicate({
        ...redisOptions,
        ...options,
    }),
    name,
);

export const redis = createRedisClient("default");
