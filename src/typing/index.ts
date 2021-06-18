import { LogLevel } from "../enum";
import { Logger } from "../class";

export type ChildLoggerContext = Array<string> | string;
export type LogDetails = Record<string, any> | Error | null;
export type SessionMetadata = Record<string, string | number | boolean>;
export type FilterCallback = (data: any) => string;

export interface LogOptions {
  context: Array<string>;
  details: LogDetails;
  level: LogLevel;
  message: string;
  session: Record<string, any>;
}

export interface Filter {
  path: string;
  callback?: FilterCallback;
}

export interface WinstonInstanceOptions {
  directory?: string;
  filter?: Array<Filter>;
  maxFileSize?: number;
  maxFiles?: number;
  packageName?: string;
  packageVersion?: string;
  test?: boolean;
}

export interface LoggerOptions extends WinstonInstanceOptions {
  context?: ChildLoggerContext;
  session?: Record<string, any>;
  parent?: Logger;
}
