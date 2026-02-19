import winston from "winston";

const { combine, timestamp, printf, colorize, json } = winston.format;

const devFormat = combine(
    colorize(),
    timestamp({ format: "HH:mm:ss" }),
    printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
);

const prodFormat = combine(timestamp(), json());

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    defaultMeta: { service: "coffee-api" },
    transports: [new winston.transports.Console()],
});

export default logger;
