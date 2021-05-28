import { LogLevel } from "../enum";
import { Logger } from "../class";

export type TChildLoggerContext = Array<string> | string;
export type TLogDetails = Record<string, any> | Error;
export type TSessionMetadata = Record<string, string | number | boolean>;
export type TFilterCallback = (data: any) => string;

export interface ILogOptions {
  context: Array<string>;
  details: TLogDetails;
  level: LogLevel;
  message: string;
  session: Record<string, any>;
}

export interface IFilter {
  path: string;
  callback?: TFilterCallback;
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

export interface ILoggerOptions extends IWinstonInstanceOptions {
  context?: TChildLoggerContext;
  session?: Record<string, any>;
  parent?: Logger;
}
