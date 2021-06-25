/* eslint-disable */
declare namespace jest {
    interface Expect {
        <T = any>(actual: T, message?: string): JestMatchers<T>;
    }
}