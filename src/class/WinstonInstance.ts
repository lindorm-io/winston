import * as winston from "winston";
import { Filter, LogOptions, WinstonInstanceOptions, FilterCallback } from "../typing";
import { HttpTransportOptions, StreamTransportOptions, FileTransportOptions } from "winston/lib/winston/transports";
import { LogLevel } from "../enum";
import { clone, get, includes, isError, set } from "lodash";
import { defaultFilterCallback, readableFormat } from "../util";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export class WinstonInstance {
  private readonly directory: string;
  private readonly filter: Array<Filter>;
  private readonly maxFileSize: number;
  private readonly maxFiles: number;
  private readonly packageName: string | null;
  private readonly packageVersion: string | null;
  private readonly test: boolean;
  private readonly winston: winston.Logger;
  private focus: string | null;

  public constructor(options: WinstonInstanceOptions) {
    this.directory = options.directory || join(homedir(), "logs");
    this.filter = options.filter || [];
    this.focus = null;
    this.maxFileSize = options.maxFileSize || 5242880;
    this.maxFiles = options.maxFiles || 10;
    this.packageName = options.packageName || null;
    this.packageVersion = options.packageVersion || null;
    this.test = options.test || false;
    this.winston = winston.createLogger();
  }

  private getFilePath(name: string): string {
    if (!this.packageName) {
      throw new Error("packageName required");
    }

    const split = this.packageName.split("/");
    let dir = this.directory;

    for (const item of split) {
      dir = join(dir, item.replace("@", ""));
    }

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    return join(dir, `${name}.log`);
  }

  private getFilePathTail(): string {
    if (!this.packageName) {
      throw new Error("packageName required");
    }

    if (!existsSync(this.directory)) {
      mkdirSync(this.directory, { recursive: true });
    }

    const name = this.packageName.replace(/\//g, "-").replace(/@/g, "");

    return join(this.directory, `tail.${name}.log`);
  }

  private getFilteredDetails(details: Record<string, any>): Record<string, any> {
    if (isError(details)) {
      return details;
    }

    const result = clone(details);

    for (const filter of this.filter) {
      const data = get(details, filter.path);
      if (!data) continue;

      const callback = filter.callback || defaultFilterCallback;
      set(result, filter.path, callback(data));
    }

    return result;
  }

  public log(options: LogOptions): void {
    if (this.test) return;
    if (this.focus && options.context.length && !includes(options.context, this.focus)) return;

    this.winston.log({
      level: options.level,
      time: new Date(),
      package: {
        name: this.packageName,
        version: this.packageVersion,
      },
      message: options.message,
      details: this.getFilteredDetails(options.details),
      context: options.context,
      session: options.session,
    });
  }

  public addFilter(path: string, callback?: FilterCallback): void {
    this.filter.push({ path, callback });
  }

  public setFocus(focus: string | null): void {
    this.focus = focus || null;
  }

  public addConsole(level: LogLevel = LogLevel.DEBUG): void {
    this.winston.add(
      new winston.transports.Console({
        handleExceptions: true,
        level,
        format: winston.format.printf(readableFormat),
      }),
    );
  }

  public addTail(level: LogLevel = LogLevel.DEBUG): void {
    this.winston.add(
      new winston.transports.File({
        filename: this.getFilePathTail(),
        handleExceptions: true,
        level,
        format: winston.format.printf(readableFormat),
        tailable: true,
      }),
    );
  }

  public addFileTransport(level: LogLevel = LogLevel.DEBUG, options?: FileTransportOptions): void {
    this.winston.add(
      new winston.transports.File({
        filename: this.getFilePath(level),
        handleExceptions: true,
        maxsize: this.maxFileSize,
        maxFiles: this.maxFiles,
        ...options,
        level,
      }),
    );
  }

  public addHttpTransport(level: LogLevel = LogLevel.DEBUG, options: HttpTransportOptions): void {
    this.winston.add(
      new winston.transports.Http({
        handleExceptions: true,
        ...options,
        level,
      }),
    );
  }

  public addStreamTransport(level: LogLevel = LogLevel.DEBUG, options: StreamTransportOptions): void {
    this.winston.add(
      new winston.transports.Stream({
        handleExceptions: true,
        ...options,
        level,
      }),
    );
  }

  public addTransport(transport: any): void {
    this.winston.add(transport);
  }
}
