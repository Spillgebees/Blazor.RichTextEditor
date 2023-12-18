/**
 * Creates a debounced function that delays invoking `func` until after `debounceIntervalInMilliseconds` milliseconds have elapsed
 * since the last time the debounced function was invoked. The debounced function returns a Promise that resolves with the result
 * of the original function `func` when it's eventually called. If `func` throws an error, the promise is rejected with this error.
 *
 * @template F - The type of the function to debounce. This function must return a Promise.
 * @template R - The return type of the debounced function (wrapped in a Promise).
 * @param {F} func - The function to debounce.
 * @param {number} debounceIntervalInMilliseconds - The number of milliseconds to wait before calling `func`.
 * @returns {(...args: Parameters<F>) => Promise<R>} A debounced version of `func`.
 */
export function debounce<F extends (...args: any[]) => Promise<R>, R>(func: F, debounceIntervalInMilliseconds: number): (...args: Parameters<F>) => Promise<R> {
    let timeout: number | undefined;

    return function(this: ThisParameterType<F>, ...args: Parameters<F>): Promise<R> {
        return new Promise<R>((resolve, reject) => {
            const context = this;

            const later = () => {
                timeout = undefined;
                try {
                    resolve(func.apply(context, args));
                } catch (error) {
                    reject(error);
                }
            };

            clearTimeout(timeout);
            timeout = window.setTimeout(later, debounceIntervalInMilliseconds);
        });
    };
}
