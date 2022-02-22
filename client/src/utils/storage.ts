const defaultTypeGuard = () => true;

export const getItem = <T>(
  key: string,
  orValue: T | void = void 0,
  typeGuard: (val: unknown) => boolean = defaultTypeGuard
) => {
  try {
    const stringVal = window.localStorage.getItem(key);
    if (!stringVal) {
      return orValue;
    }
    const parsed = JSON.parse(stringVal);
    const val = parsed?.val;
    if (typeof val === 'undefined') {
      return orValue;
    }
    if (!typeGuard(val)) {
      console.warn('getItem value warning - invalid type', key, val);
      return orValue;
    }
    return val as T;
  } catch (e) {
    console.error('getItem error', e);
    return orValue;
  }
};

export const setItem = <T>(key: string, val: T): T => {
  window.localStorage.setItem(key, JSON.stringify({ val }));
  return val;
};
