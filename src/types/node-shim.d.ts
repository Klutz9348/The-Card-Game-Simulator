declare module "node:test" {
  type TestFunction = (name: string, fn: () => void | Promise<void>) => void;
  export const describe: TestFunction;
  export const it: TestFunction;
  const test: TestFunction;
  export default test;
}

declare module "node:assert/strict" {
  interface Assert {
    (value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    notStrictEqual(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    throws(block: () => unknown, error?: RegExp | Function, message?: string): void;
  }
  const assert: Assert;
  export = assert;
}
