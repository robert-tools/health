/**
 * 🧪 testing module
 * @version <version>
 * @date <date>
 * @license <license>
 * @author <author> <github.com/<user>>
 */
import { sample } from './index';

describe('@robert.tools/sample', () => {
    it('should return a <name> string', () => {
        expect(sample('hello')).toBe('sample: hello');
    });

    it('should return a <name> string with empty input', () => {
        expect(sample('')).toBe('sample: ');
    });
});
