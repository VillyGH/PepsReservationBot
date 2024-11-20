import '@types/jest';

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeWithinRange(min: number, max: number): R;
        }
    }
}

export {};
