# general
- use prettier und editorconfig for formatting

# TypeScript conventions

- Always use object property shorthand when the key and variable name are identical.
- Prefer `{ foo }` over `{ foo: foo }`.
- Use single quotes ('') for strings instead of double quotes ("").
- Generated code must pass the repository ESLint configuration.
- import of types always like: `import type { <tpype> } from './<file>.d';`

# JSDoc

Use exactly this format.

### Function

```ts
/**
 * 🎯 Description.
 * @param {Type} name ➡️ Description.
 * @returns {Type} 📤 Description.
 */
```

### File

```ts
/**
 * 🎯 Description.
 * @module path/to/module
 * @example Example.method();
 * @version x.y.z
 * @date YYYY-MM-DD
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */
```