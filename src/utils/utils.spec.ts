/**
 * 🧪 testing module
 * @version 1.0.0
 * @date 2026-10-12
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */

import type { LOG_ENTRIES } from './../index.d';
import { getNumByType, printLogs } from './utils';
import { LOG } from '@robert.tools/log';


describe('✅ printLogs()', () => {
    const FN = printLogs;
    const spyOK = jest.spyOn(LOG, 'OK');
    const spyFAIL = jest.spyOn(LOG, 'FAIL');
    afterEach(() => {
        jest.clearAllMocks();
    });
    const logItems: LOG_ENTRIES = [
        { type: 'OK', message: 'ok', context: 'ctx' },
        { type: 'FAIL', message: 'fail', context: 'ctx' },
    ];
    it('should print all logs correctly', () => {
        // Just call the function to ensure it doesn't throw
        FN(logItems);
        expect(spyOK).toHaveBeenCalledWith('[ctx] ok');
        expect(spyFAIL).toHaveBeenCalledWith('[ctx] fail');
    });
    it('should print only logs of the specified type', () => {
        const spyOK = jest.spyOn(LOG, 'OK');
        const spyFAIL = jest.spyOn(LOG, 'FAIL');
        FN(logItems, 'OK');
        expect(spyOK).toHaveBeenCalledWith('[ctx] ok');
        expect(spyFAIL).not.toHaveBeenCalled();
    });
});

describe('✅ getNumByType()', () => {
    const FB = getNumByType;
    it('should return 0 for an empty array', () => {
        expect(FB([], 'OK')).toBe(0);
    });
    it('should return the correct count for a non-empty array', () => {
        const logItems: LOG_ENTRIES = [
            { type: 'OK', message: 'ok', context: 'ctx' },
            { type: 'FAIL', message: 'fail', context: 'ctx' },
            { type: 'OK', message: 'ok', context: 'ctx' },
        ];
        expect(FB(logItems, 'OK')).toBe(2);
        expect(FB(logItems, 'FAIL')).toBe(1);
        expect(FB(logItems, 'INFO')).toBe(0);
    });
});
