import { TObject } from "@lindorm-io/core";

export type TLogDetails = TObject<any> | Error;
export type TChildLoggerContext = Array<string> | string;
export type TSessionMetadata = TObject<string | number | boolean>;
