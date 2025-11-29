import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner';

export const useConvexMutation = (mutation) => {
  const mutationFn = useMutation(mutation);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (...args) => {
    setIsLoading(true);
    setError(null);
    try{
      const response = await mutationFn(...args);
      setData(response);
      return response;
    }catch(err){
      setError(err);
      toast.error(err.message);
    }
    finally{
      setIsLoading(false);
    }
  }

  return { data, error, isLoading, mutate };
}