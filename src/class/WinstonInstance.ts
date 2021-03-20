import * as winston from "winston";
import { HttpTransportOptions, StreamTransportOptions, FileTransportOptions } from "winston/lib/winston/transports";
import { LogLevel } from "../enum";
import { TFunction, TObject } from "../typing";
import { TLogDetails } from "../typing";
import { clone, get, isError, set } from "lodash";
import { defaultFilterCallback, readableFormat } from "../util";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export interface ILogOptions {
  context: Array<string>;
  details: TLogDetails;
  level: LogLevel;
  message: string;
  session: TObject<any>;
}

export interface IFilter {
  path: string;
  callback?: TFunction<any>;
}

export interface IWinstonInstanceOptions {
  directory?: string;
  filter?: Array<IFilter>;
  maxFileSize?: number;
  maxFiles?: number;
  packageName?: string;
  packageVersion?: string;
  test?: boolean;
}

export class WinstonInstance {
  private directory: string;
  private filter: Array<IFilter>;
  private maxFileSize: number;
  private maxFiles: number;
  private packageName: string;
  private packageVersion: string;
  private test: boolean;
  private winston: winston.Logger;

  constructor(options: IWinstonInstanceOptions) {
    this.directory = options.directory || join(homedir(), "logs");
    this.filter = options.filter || [];
    this.maxFileSize = options.maxFileSize || 5242880;
    this.maxFiles = options.maxFiles || 10;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
    this.test = options.test || false;
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

    for (const filter of this.filter) {
      const data = get(details, filter.path);
      if (!data) continue;

      const callback = filter.callback || defaultFilterCallback;
      set(result, filter.path, callback(data));
    }

    return result;
  }

  public log(options: ILogOptions): void {
    if (this.test) return;

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

  public addFilter(path: string, callback?: TFunction<any>): void {
    this.filter.push({ path, callback });
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
