import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * useFetch is a lightweight async utility hook:
 * - run: function to execute an async function and manage loading/error/data
 * - data, error, loading state values
 * - optional immediate execution with dependencies
 */
export function useFetch(asyncFn, { immediate = false, deps = [] } = {}) {
  const mounted = useRef(true);
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!!immediate);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        if (mounted.current) setData(result);
        return result;
      } catch (e) {
        if (mounted.current) setError(e);
        return Promise.reject(e);
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, run, setData, setError, setLoading };
}

export default useFetch;
