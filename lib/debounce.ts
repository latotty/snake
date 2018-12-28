export const debounce = <T extends Function>(func: T, delay: number): T => {
  let inDebounce: number;
  return (function(this: unknown) {
    const context = this;
    const args = arguments;
    window.clearTimeout(inDebounce);
    inDebounce = window.setTimeout(() => func.apply(context, args), delay);
  } as any) as T;
};
