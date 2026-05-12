import { useState } from 'react';

export const useApiHandler = <T>(apiFn: (...args: any[]) => Promise<T>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFn(...args);
      return result;
    } catch (err: any) {
      console.error('API Error:', err);
      setError(
        (err.response?.data?.message || err.message) ?? 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};
