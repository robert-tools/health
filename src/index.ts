import { command } from '@robert.tools/cmd';
import { getHttpStatusValue } from '@robert.tools/http';
import { green, LOG, red, white, yellow } from '@robert.tools/log';
import { getProp } from '@robert.tools/utils';
import type { LOG_ENTRIES, LOG_ENTRY } from './index.d';
import { FS } from '@robert.tools/fs';
import { getNumByType, printLogs } from './utils/utils';

export const checkConnection = (
    ctx: string,
    url: string,
    opts: any = {}
): LOG_ENTRIES => {
    const timeout = getProp(opts, 'timeout', 5_000);
    const interval = getProp(opts, 'interval', 500); // in ms
    const started = Date.now();

    const httpConfig = {
        forwarding: true,
        method: 'GET',
        showLog: false,
        timeout: 200,
    };
    let isReady = false;
    let lastState: string = '0';
    const logEntries: LOG_ENTRIES = [];
    while (Date.now() - started < timeout) {
        const message = `⏳ Checking status...`;
        logEntries.push({ type: 'INFO', message, context: ctx });
        try {
            const remaining = timeout - (Date.now() - started);
            const httpStatus: string = getHttpStatusValue(url, httpConfig);
            lastState = httpStatus;
            if (httpStatus === '200') {
                // LOG.OK(`Vite is ready. [🌐 http: ${httpStatus}]`);
                isReady = true;
                break;
            } else {
                const debug = `[🌐 http: ${httpStatus} / ⏳ remain: ${remaining}ms]`;
                const message = `WAITING ... ${debug}`;
                logEntries.push({ type: 'INFO', message, context: ctx });
            }
            command(`sleep ${interval / 1000}`);
        } catch (e: any) {
            const message = `Error while checking status: ${e.message}`;
            logEntries.push({ type: 'FAIL', message, context: ctx });
            // retry
        }
    }
    if (isReady) {
        const message = `is ready (🌐 status: ${lastState})`;
        logEntries.push({ type: 'OK', message, context: ctx });
    } else {
        const message = `is not ready  (🌐 status: ${lastState})`;
        logEntries.push({ type: 'FAIL', message, context: ctx });
    }
    return logEntries;
};

export const showLogs = (logItems: LOG_ENTRIES, showAll = false) => {
    if (showAll) {
        const contextes = logItems
            .map((logEntry: LOG_ENTRY) => logEntry.context)
            .filter((value, index, self) => self.indexOf(value) === index);
        for (const context of contextes) {
            const ctxLogs = logItems.filter(
                (logEntry: LOG_ENTRY) => logEntry.context === context
            );
            printLogs(ctxLogs);
        }
    }

    const all = logItems.length;
    const ok = getNumByType(logItems, 'OK');
    const warn = getNumByType(logItems, 'WARN');
    const fail = getNumByType(logItems, 'FAIL');
    const info = getNumByType(logItems, 'INFO');

    // export const colorize = (msg: string, bg: string, fg: string, pad = '  ') => {
    const strOK = green(`OK: ${ok}`);
    const strWARN = yellow(`WARN: ${warn}`);
    const strFAIL = red(`FAIL: ${fail}`);
    const strINFO = white(`INFO: ${info}`);

    const stats = `${strOK}, ${strWARN}, ${strFAIL}, ${strINFO}`;
    // all logs ecept fail and warn
    // const failed = ['FAIL', 'WARN'];
    const passed = ok + info;
    if (passed === all) {
        const statsOk = `${green(passed)}/${green(all)}`;
        const message = `☘️💚 Healthcheck passed: All checks are good!`;
        LOG.OK(`${message} [${statsOk}, ${stats}]`);
        if (!showAll) {
            // show ok logs
            const allowed = ['OK', 'INFO'];
            for (const allow of allowed) {
                const okLogs = logItems.filter(
                    (logEntry) => logEntry.type === allow
                );
                printLogs(okLogs);
            }
        }
    } else {
        const statsFail = `${red(passed)}/${all}`;
        const message = `☘️💔 Healthcheck failed: Some checks not pass!`;
        LOG.FAIL(`${message} [${statsFail}, ${stats}]`);
        const allowed = ['FAIL', 'WARN'];
        for (const allow of allowed) {
            const okLogs = logItems.filter(
                (logEntry) => logEntry.type === allow
            );
            printLogs(okLogs);
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
