import { useEffect, useState } from 'react';
import { debounce } from '../lib/debounce';

export const windowSizeHook = (
  initialSize: [number, number] = [800, 600],
): [number, number] => {
  const [size, setSize] = useState<[number, number]>(initialSize);

  useEffect(() => {
    const onChange = () => {
      const { innerWidth, innerHeight } = window;
      if (size[0] !== innerWidth || size[1] !== innerHeight) {
        setSize([innerWidth, innerHeight]);
      }
    };
    onChange();

    const onChangeDebounced = debounce(onChange, 500);
    window.addEventListener('resize', onChangeDebounced);
    return () => window.removeEventListener('resize', onChangeDebounced);
  }, []);

  return size;
};
