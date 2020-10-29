import * as winston from "winston";
import { HttpTransportOptions, StreamTransportOptions, FileTransportOptions } from "winston/lib/winston/transports";
import { LogLevel } from "../enum";
import { TLogDetails } from "../typing";
import { TObject } from "@lindorm-io/global";
import { clone, get, isError, set } from "lodash";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { readableFormat } from "../util";

export interface ILogOptions {
  context: Array<string>;
  details: TLogDetails;
  level: LogLevel;
  message: string;
  session: TObject<any>;
}

export interface IWinstonInstanceOptions {
  directory?: string;
  filter?: Array<string>;
  maxFiles?: number;
  maxFileSize?: number;
  packageName?: string;
  packageVersion?: string;
}

export class WinstonInstance {
  readonly directory: string;
  private filter: Array<string>;
  readonly maxFiles: number;
  readonly maxFileSize: number;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly winston: winston.Logger;

  constructor(options: IWinstonInstanceOptions) {
    this.directory = options.directory || join(homedir(), "logs");
    this.filter = options.filter || [];
    this.maxFiles = options.maxFiles || 10;
    this.maxFileSize = options.maxFileSize || 5242880;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
    this.winston = winston.createLogger();
  }

  private getFilePath(name: string): string {
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
    if (!existsSync(this.directory)) {
      mkdirSync(this.directory, { recursive: true });
    }
    const name = this.packageName.replace(/\//g, "-").replace(/@/g, "");
    return join(this.directory, `tail.${name}.log`);
  }

  private getFilteredDetails(details: TObject<any>): TObject<any> {
    if (isError(details)) {
      return details;
    }
    const result = clone(details);
    for (const path of this.filter) {
      if (!get(details, path)) continue;
      set(result, path, "[Filtered]");
    }
    return result;
  }

  public log(options: ILogOptions): void {
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

  public addFilter(path: string): void {
    this.filter.push(path);
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
