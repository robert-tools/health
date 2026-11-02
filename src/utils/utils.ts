import { LOG } from '@robert.tools/log';

import type { LOG_ENTRIES } from '../index.d';

/**
 * 🎯 Prints the log entries to the console, optionally filtering by type.
 * @param {LOG_ENTRIES} logItems ➡️ array of log entries
 * @param {string} [filterBy] ➡️ log type to filter by (optional)
 * @returns {void} 📤 This function does not return a value.
 */
export const printLogs = (logItems: LOG_ENTRIES, filterBy?: string) => {
    for (const logEntry of logItems) {
        if (filterBy && logEntry.type !== filterBy) continue;
        LOG[logEntry.type](`[${logEntry.context}] ${logEntry.message}`);
    }
};

/**
 * 🎯 Counts the number of log entries of a specific type.
 * @param {LOG_ENTRIES} logItems ➡️ The array of log entries to count.
 * @param {string} type ➡️ The log type to count.
 * @returns {number} 📤 The number of log entries of the specified type.
 */
export const getNumByType = (logItems: LOG_ENTRIES, type: string): number => {
    return logItems.filter((logEntry) => logEntry.type === type).length;
};
