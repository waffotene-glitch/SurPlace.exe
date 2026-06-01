import { useState } from "react";
export function useAsyncTask() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async <T,>(task: () => Promise<T>) => {
    try {
      setIsLoading(true);
      setError(null);
      return await task();
    } catch (taskError) {
      const message =
        taskError instanceof Error ? taskError.message : "Something went wrong";
      setError(message);
      throw taskError;
    } finally {
      setIsLoading(false);
    }
  };
