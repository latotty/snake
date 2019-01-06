import Msgpack from 'msgpack-lite';

export function uniencode<T>(obj: T) {
  return toBase64(Msgpack.encode(obj))
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
}

export function unidecode<T>(str: string): T {
  const base64Str = str.replace(/\_/g, '/').replace(/\-/g, '+');
  const buff = fromBase64(base64Str);
  const config = Msgpack.decode(buff);
  return config;
}

const toBase64 = (u8: Buffer) => {
  if (process.browser) {
    return btoa(String.fromCharCode(...u8));
  }
  return Buffer.from(u8).toString('base64');
};

const fromBase64 = (str: string) => {
  return process.browser
    ? new Uint8Array(
        atob(str)
          .split('')

          .map(function(c) {
            return c.charCodeAt(0);
          }),
      )
    : Buffer.from(str, 'base64');
};
