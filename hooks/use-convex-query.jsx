import { useQuery } from 'convex/react'
import { useState,useEffect } from 'react'
import { toast } from 'sonner';

export const useConvexQuery = (query,...args) => {
  const result = useQuery(query,...args);

  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if(result === undefined) {
      setIsLoading(true);
    }else{
      try{
        setData(result);
        setError(null);
      }catch(err){
        setError(err);
        toast.error(err.message);
      }finally{
        setIsLoading(false);
      }
    }
  },[result])

  return { data, error, isLoading };
}