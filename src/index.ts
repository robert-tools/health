import { command } from '@robert.tools/cmd';
import { getHttpStatusValue } from '@robert.tools/http';
import { blue, green, LOG, red, yellow } from '@robert.tools/log';
import { getProp } from '@robert.tools/utils';
import type { LOG_ENTRIES, LOG_ENTRY } from './index.d';
import { FS } from '@robert.tools/fs';
import { getNumByType, printLogs } from './utils/utils';

const timeout = 200;
const httpConfig = { forwarding: true, method: 'GET', showLog: false, timeout };

/**
 * 🎯 Checks the connection to a given URL and logs the status.
 * @param {string} ctx ➡️ context of log entries
 * @param {string} url ➡️ URL to check
 * @param {any} opts ➡️ optional configuration
 * @returns {LOG_ENTRIES} 📤 array of log entries as checkresult
 */
export const checkConnection = (
    ctx: string,
    url: string,
    opts: any = {}
): LOG_ENTRIES => {
    const timeout = getProp(opts, 'timeout', 5_000);
    const interval = getProp(opts, 'interval', 500); // in ms
    const started = Date.now();

    let isReady = false;
    let lastState: string = '0';
    const logs: LOG_ENTRIES = [];
    while (Date.now() - started < timeout) {
        const message = `⏳ Checking status...`;
        logs.push({ type: 'INFO', message, context: ctx });
        try {
            const remaining = timeout - (Date.now() - started);
            const httpStatus: string = getHttpStatusValue(url, httpConfig);
            lastState = httpStatus;
            if (httpStatus === '200') {
                isReady = true;
                break;
            } else {
                const debug = `[🌐 http: ${httpStatus} / ⏳ remain: ${remaining}ms]`;
                const message = `WAITING ... ${debug}`;
                logs.push({ type: 'INFO', message, context: ctx });
            }
            command(`sleep ${interval / 1000}`);
        } catch (e: any) {
            const message = `Error while checking status: ${e.message}`;
            logs.push({ type: 'FAIL', message, context: ctx });
            // retry
        }
    }
    const type = isReady ? 'OK' : 'FAIL';
    const message = `${isReady ? '' : 'not '}ready (🌐 status: ${lastState})`;
    logs.push({ type, message, context: ctx });
    return logs;
};

/**
 * 🎯 Displays log entries with optional filtering based on their type
 * @param {LOG_ENTRIES} logs ➡️ array of log entries
 * @param {boolean} showAll ➡️ flag indicate to show all or only relevant logs
 * @returns {void} 📤 This function does not return a value.
 */
export const showLogs = (logs: LOG_ENTRIES, showAll: boolean = false): void => {
    if (showAll) {
        const contextes = logs
            .map((logEntry: LOG_ENTRY) => logEntry.context)
            .filter((value, index, self) => self.indexOf(value) === index);
        for (const context of contextes) {
            const ctxLogs = logs.filter(
                (logEntry: LOG_ENTRY) => logEntry.context === context
            );
            printLogs(ctxLogs);
        }
    }

    const all = logs.length;
    const ok = getNumByType(logs, 'OK');
    const warn = getNumByType(logs, 'WARN');
    const fail = getNumByType(logs, 'FAIL');
    const info = getNumByType(logs, 'INFO');

    // export const colorize = (msg: string, bg: string, fg: string, pad = '  ') => {
    const strOK = green(`OK: ${ok}`);
    const strWARN = yellow(`WARN: ${warn}`);
    const strFAIL = red(`FAIL: ${fail}`);
    const strINFO = blue(`INFO: ${info}`);

    const statsDetail = `${strOK}, ${strWARN}, ${strFAIL}, ${strINFO}`;
    const passed = ok + info;
    let allowed = ['OK', 'INFO'];
    const hasPassed = passed === all;
    const type = hasPassed ? 'OK' : 'FAIL';
    let message = `☘️💚 Healthcheck passed: All checks passed!`;
    const fn = hasPassed ? green : red;
    if (!hasPassed) {
        message = `☘️💔 Healthcheck failed: Some checks not pass!`;
        allowed = ['FAIL', 'WARN'];
    }
    const statsSum = `${fn(passed)}/${fn(all)}`;
    LOG[type](`${message} [${statsSum}, ${statsDetail}]`);
    if (!showAll) {
        // show just allowed logs
        for (const allow of allowed) {
            const someLogs = logs.filter((logEntry) => logEntry.type === allow);
            printLogs(someLogs);
        }
    }
};

/**
 * 🎯 Checks the existence of a folder and the presence of HTML files within it.
 * @param {string} context ➡️ The context in which the check is performed.
 * @param {string} folder ➡️ The path to the folder to check.
 * @returns {LOG_ENTRIES} 📤 logging result
 */
export const checkFolder = (context: string, folder: string): LOG_ENTRIES => {
    const logEntries: LOG_ENTRIES = [];
    if (FS.exists(folder)) {
        const message = `Folder exists: ${folder}`;
        logEntries.push({ type: 'OK', message, context });
    } else {
        const message = `Folder does not exist: ${folder}`;
        logEntries.push({ type: 'FAIL', message, context });
    }
    const numHTMLFiles = FS.exists(folder)
        ? FS.list(folder).filter((file) => file.endsWith('.html')).length
        : 0;
    if (numHTMLFiles > 0) {
        const message = `Number of HTML files in folder: ${numHTMLFiles}`;
        logEntries.push({ type: 'OK', message, context });
    } else {
        const message = `No HTML files found in folder: ${folder}`;
        logEntries.push({ type: 'FAIL', message, context });
    }
    return logEntries;
};
