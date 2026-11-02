import mock from 'mock-fs';
import { checkConnection, checkFolder, showLogs } from './index';

import * as HTTP from '@robert.tools/http';
import { blue, green, LOG, red, yellow } from '@robert.tools/log';
import * as COMMAND from '@robert.tools/cmd';
import type { LOG_ENTRIES } from './index.d';

const mockSleeping = (cmd: string) => {
    const seconds = Number(cmd.split(' ')[1]);
    jest.advanceTimersByTime(seconds * 1000);
    return '' as any;
};
describe('✅ checkConnection()', () => {
    const FN = checkConnection;
    const URI = 'http://localhost:3000';
    const context = 'TEST';
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });
    beforeEach(() => {
        jest.useFakeTimers();
        // simulate sleeping
        jest.spyOn(COMMAND, 'command').mockImplementation(mockSleeping);
    });

    it('should detect server becoming ready after 2 seconds', () => {
        const started = Date.now();

        jest.spyOn(HTTP, 'getHttpStatusValue').mockImplementation(() => {
            return Date.now() - started >= 2000 ? '200' : '0';
        });

        const result = FN(context, URI, { timeout: 5000, interval: 500 });

        expect(result.at(-1)?.type).toBe('OK');
        expect(HTTP.getHttpStatusValue).toHaveBeenCalledTimes(5);
    });
    it('should detect server never becoming ready within timeout', () => {
        jest.spyOn(HTTP, 'getHttpStatusValue').mockImplementation(() => {
            return '0';
            // return Date.now() - started >= 2000 ? '200' : '0';
        });

        const result = FN(context, URI, { timeout: 5000, interval: 500 });

        expect(result.at(-1)?.type).toBe('FAIL');
        expect(HTTP.getHttpStatusValue).toHaveBeenCalledTimes(10);
    });
    it('should detect server becoming ready immediately', () => {
        jest.spyOn(HTTP, 'getHttpStatusValue').mockImplementation(() => {
            return '200';
        });

        const result = FN(context, URI, { timeout: 5000, interval: 500 });

        expect(result.at(-1)?.type).toBe('OK');
        expect(HTTP.getHttpStatusValue).toHaveBeenCalledTimes(1);
    });
    it('should catch an error', () => {
        jest.spyOn(HTTP, 'getHttpStatusValue')
            .mockImplementationOnce(() => {
                throw new Error('Connection refused');
            })
            .mockReturnValue('200');

        const result = FN(context, URI);

        const message = 'Error while checking status: Connection refused';
        expect(result).toContainEqual({ type: 'FAIL', message, context });

        expect(result.at(-1)?.type).toBe('OK');
    });
});

const showMsg = (
    msg: string,
    ok: number,
    warn: number,
    fail: number,
    info: number
) => {
    const OK = green(`OK: ${ok}`);
    const WARN = yellow(`WARN: ${warn}`);
    const FAIL = red(`FAIL: ${fail}`);
    const INFO = blue(`INFO: ${info}`);
    const isOK = fail === 0;
    const all = ok + warn + fail + info;
    const stats = isOK
        ? `${green(ok)}/${green(all)}`
        : `${red(fail)}/${red(all)}`;
    const allStats = `[${stats}, ${OK}, ${WARN}, ${FAIL}, ${INFO}]`;
    return `${msg} ${allStats}`;
};

describe('showLogs()', () => {
    const FN = showLogs;
    let spyOK: jest.SpyInstance;
    let spyFAIL: jest.SpyInstance;
    beforeEach(() => {
        spyOK = jest.spyOn(LOG, 'OK');
        spyFAIL = jest.spyOn(LOG, 'FAIL');
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('FAIL', () => {
        const logs: LOG_ENTRIES = [
            { type: 'OK', message: 'All good', context: 'CTX1' },
            { type: 'FAIL', message: 'Something went wrong', context: 'CTX2' },
        ];
        it('should display all logs when showAll is true', () => {
            FN(logs, true);
            expect(spyOK).toHaveBeenCalledWith('[CTX1] All good');
            expect(spyFAIL).toHaveBeenCalledWith('[CTX2] Something went wrong');
            const message = `☘️💔 Healthcheck failed: Some checks not pass!`;
            const final = showMsg(message, 1, 0, 1, 0);
            expect(spyFAIL).toHaveBeenCalledWith(final);
            expect(spyFAIL).toHaveBeenCalledTimes(2);
        });
        it('should display only failed logs when showAll is false', () => {
            FN(logs, false);
            expect(spyOK).not.toHaveBeenCalled();
            expect(spyFAIL).toHaveBeenCalledWith('[CTX2] Something went wrong');
            expect(spyFAIL).toHaveBeenCalledTimes(2);
        });
    });
    describe('OK', () => {
        const logs: LOG_ENTRIES = [
            { type: 'OK', message: 'All good', context: 'CTX1' },
            // { type: 'FAIL', message: 'Something went wrong', context: 'CTX2' },
        ];
        it('should display all logs when showAll is true', () => {
            FN(logs, true);
            expect(spyOK).toHaveBeenCalledWith('[CTX1] All good');
            expect(spyFAIL).not.toHaveBeenCalled();
            const message = `☘️💚 Healthcheck passed: All checks passed!`;
            const final = showMsg(message, 1, 0, 0, 0);
            expect(spyOK).toHaveBeenCalledWith(final);
            expect(spyOK).toHaveBeenCalledTimes(2);
        });
        it('should display only successful message when showAll is false', () => {
            FN(logs); // use default
            expect(spyOK).toHaveBeenCalledWith('[CTX1] All good');
            expect(spyFAIL).not.toHaveBeenCalled();
            const message = `☘️💚 Healthcheck passed: All checks passed!`;
            const final = showMsg(message, 1, 0, 0, 0);
            expect(spyOK).toHaveBeenCalledWith(final);
            expect(spyOK).toHaveBeenCalledTimes(2);
        });
    });
});

describe('✅ checkFolder()', () => {
    const FN = checkFolder;
    afterEach(() => {
        mock.restore();
        jest.clearAllMocks();
        // readline.cursorTo(process.stdout, 0);
    });
    const PATH = '/some/folder/path';
    const context = 'ctx';
    const MSG_NO_HTML = `No HTML files found in folder: ${PATH}`;
    it('should detect non-existing folder and HTML files', () => {
        // Test implementation goes here
        mock({});

        const logs = FN(context, PATH);
        const type = 'FAIL';
        expect(logs).toEqual([
            { type, message: `Folder does not exist: ${PATH}`, context },
            { type, message: MSG_NO_HTML, context },
        ]);
    });
    it('should detect existing folder with HTML files', () => {
        mock({
            '/some/folder/path': {
                'index.html': '<html></html>',
            },
        });

        const logs = FN(context, PATH);
        const type = 'OK';
        expect(logs).toEqual([
            { type, message: `Folder exists: ${PATH}`, context },
            { type, message: 'Number of HTML files in folder: 1', context },
        ]);
    });
    it('should detect existing folder without HTML files', () => {
        mock({
            '/some/folder/path': {},
        });

        const logs = FN(context, PATH);
        const typeOk = 'OK';
        const typeFail = 'FAIL';
        expect(logs).toEqual([
            { type: typeOk, message: `Folder exists: ${PATH}`, context },
            { type: typeFail, message: MSG_NO_HTML, context },
        ]);
    });
});
