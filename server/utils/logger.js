import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "../config/index.js";

const logLevels = {
  error: 0,
  warning: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warning: "yellow",
  info: "green",      
  http: "cyan",
  debug: "grey",     
};

winston.addColors(colors);

const colorizer = winston.format.colorize({ all: true }).colorize;

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, logMetadata, stack }) => {
    const line = `${timestamp} ${level}: ${logMetadata || ""} ${message} ${stack || ""}`;
    return colorizer(level, line); 
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  levels: logLevels,
  level: config.logLevel,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),

    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "1",
      format: fileFormat,
    }),
  ],
});

export default logger;
