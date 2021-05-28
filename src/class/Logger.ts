import fastSafeStringify from "fast-safe-stringify";
import { HttpTransportOptions, StreamTransportOptions, FileTransportOptions } from "winston/lib/winston/transports";
import { ILoggerOptions, TChildLoggerContext, TFilterCallback, TLogDetails, TSessionMetadata } from "../typing";
import { LogLevel } from "../enum";
import { WinstonInstance } from "./WinstonInstance";
import { clone, isArray, isString, isObject } from "lodash";

export class Logger {
  private readonly context: Array<string>;
  private readonly winston: WinstonInstance;
  private session: Record<string, any> | undefined;

  constructor(options: ILoggerOptions = {}) {
    if (!options.parent && (!options.packageName || !options.packageVersion)) {
      throw new Error("winston needs to be initialized with [ packageName ] and [ packageVersion ]");
    }

    if (!options.parent) {
      this.context = [];
      this.winston = new WinstonInstance(options);
    } else {
      this.context = clone(options.parent.context);
      this.winston = options.parent.winston;
    }

    if (options.session) {
      this.session = options.session;
    } else if (options.parent) {
      this.session = clone(options.parent.session);
    }

    this.addContext(options.context || []);
  }

  private addContext(context: TChildLoggerContext): void {
    if (isArray(context)) {
      for (const item of context) {
        this.context.push(item);
      }
    } else if (isString(context)) {
      this.context.push(context);
    }
  }

  public error(message: string, details?: TLogDetails): void {
    this.winston.log({
      level: LogLevel.ERROR,
      message,
      details: details || {},
      context: this.context,
      session: this.session || {},
    });
  }

  public warn(message: string, details?: TLogDetails): void {
    this.winston.log({
      level: LogLevel.WARN,
      message,
      details: details || {},
      context: this.context,
      session: this.session || {},
    });
  }

  public info(message: string, details?: TLogDetails): void {
    this.winston.log({
      level: LogLevel.INFO,
      message,
      details: details || {},
      context: this.context,
      session: this.session || {},
    });
  }

  public verbose(message: string, details?: TLogDetails): void {
    this.winston.log({
      level: LogLevel.VERBOSE,
      message,
      details: details || {},
      context: this.context,
      session: this.session || {},
    });
  }

  public debug(message: string, details?: TLogDetails): void {
    this.winston.log({
      level: LogLevel.DEBUG,
      message,
      details: details || {},
      context: this.context,
      session: this.session || {},
    });
  }

  public silly(message: string, details?: TLogDetails): void {
    this.winston.log({
      level: LogLevel.SILLY,
      message,
      details: details || {},
      context: this.context,
      session: this.session || {},
    });
  }

  public createChildLogger(context: TChildLoggerContext): Logger {
    if (!isString(context) && !isArray(context)) {
      throw new Error(`Invalid context [ ${context} ]`);
    }

    return new Logger({ context, parent: this });
  }

  public createSessionLogger(session: Record<string, any>): Logger {
    if (!isObject(session)) {
      throw new Error(`Invalid session [ ${session} ]`);
    }

    if (this.session) {
      throw new Error(`Session already exists [ ${fastSafeStringify(this.session)} ]`);
    }

    return new Logger({ session, parent: this });
  }

  public addSessionMetadata(metadata: TSessionMetadata): void {
    if (!this.session) {
      throw new Error(`Session does not exist [ ${fastSafeStringify(this.session)} ]`);
    }

    this.session = {
      ...this.session,
      metadata,
    };
  }

  public addFilter(path: string, callback?: TFilterCallback): void {
    this.winston.addFilter(path, callback);
  }

  public setFocus(focus: string | null): void {
    this.winston.setFocus(focus);
  }

  public addConsole(level: LogLevel = LogLevel.DEBUG): void {
    this.winston.addConsole(level);
  }

  public addTail(level: LogLevel = LogLevel.DEBUG): void {
    this.winston.addTail(level);
  }

  public addFileTransport(level: LogLevel = LogLevel.DEBUG, options?: FileTransportOptions): void {
    this.winston.addFileTransport(level, options);
  }

  public addHttpTransport(level: LogLevel = LogLevel.DEBUG, options: HttpTransportOptions): void {
    this.winston.addHttpTransport(level, options);
  }

  public addStreamTransport(level: LogLevel = LogLevel.DEBUG, options: StreamTransportOptions): void {
    this.winston.addStreamTransport(level, options);
  }

  public addTransport(transport: any): void {
    this.winston.addTransport(transport);
  }
}
