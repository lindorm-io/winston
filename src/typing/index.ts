import { TObject } from "@lindorm-io/global";

export type TLogDetails = TObject<any> | Error;
export type TChildLoggerContext = Array<string> | string;
export type TSessionMetadata = TObject<string | number | boolean>;
