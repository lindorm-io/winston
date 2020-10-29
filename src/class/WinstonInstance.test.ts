import { LogLevel } from "../enum";
import { WinstonInstance } from "./WinstonInstance";

let winstonLog = jest.fn();

jest.mock("winston", () => ({
  createLogger: jest.fn(() => ({
    log: winstonLog,
  })),
}));

describe("WinstonInstance.ts", () => {
  let winston: WinstonInstance;

  beforeEach(() => {
    winston = new WinstonInstance({
      packageName: "package-name",
      packageVersion: "0.0.1",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should log", () => {
    winston.log({
      level: LogLevel.SILLY,
      message: "message",
      details: { mock: "details" },
      context: ["context"],
      session: { mock: "session" },
    });

    expect(winstonLog).toHaveBeenCalledWith({
      context: ["context"],
      details: {
        mock: "details",
      },
      level: "silly",
      message: "message",
      package: {
        name: "package-name",
        version: "0.0.1",
      },
      session: {
        mock: "session",
      },
      time: expect.any(Date),
    });
  });

  test("should add filter", () => {
    winston.addFilter("filtered.path.message");
    winston.log({
      level: LogLevel.SILLY,
      message: "message",
      details: { mock: "details", filtered: { path: { message: "message" } } },
      context: ["context"],
      session: { mock: "session" },
    });

    expect(winstonLog).toHaveBeenCalledWith({
      context: ["context"],
      details: {
        filtered: {
          path: {
            message: "[Filtered]",
          },
        },
        mock: "details",
      },
      level: "silly",
      message: "message",
      package: {
        name: "package-name",
        version: "0.0.1",
      },
      session: {
        mock: "session",
      },
      time: expect.any(Date),
    });
  });
});
