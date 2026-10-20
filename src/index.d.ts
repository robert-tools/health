export type LOG_TYPE = 'INFO' | 'FAIL' | 'OK';
export type LOG_ENTRY = { type: LOG_TYPE; message: string; context: string };
export type LOG_ENTRIES = LOG_ENTRY[];
