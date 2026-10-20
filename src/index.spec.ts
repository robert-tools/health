import mock from 'mock-fs';
import { checkFolder } from './index';

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
