export type TChildLoggerContext = Array<string> | string;
export type TFunction<T> = (...args: any) => T;
export type TLogDetails = TObject<any> | Error;
export type TObject<T> = Record<string, T>;
export type TSessionMetadata = TObject<string | number | boolean>;
