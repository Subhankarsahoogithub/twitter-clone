import { useMutation,useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow=()=>{

     const queryClient=useQueryClient();
     //used to invalidate the querry:

     const {mutate:follow,isPending}=useMutation({
         mutationFn:async(userId)=>{
            try {
                //make a post request for follow/unfollow on the backend:
                const res=await fetch(`api/user/follow/${userId}`,{
                    method:"POST",

                });
                //get the data:
                const data=await res.json();
                //invalid response:
                if(!res.ok) throw new Error(data.error || "something went wrong:");
                //return the response:
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
         },

         onSuccess:()=>{
            //wait for both the promises to be resolved:
            Promise.all([
                queryClient.invalidateQueries({queryKey:["suggestedUsers"]}),
                queryClient.invalidateQueries({queryKey:["authUser"]})
            ]);

         },
         onError:(error)=>{
            toast.error(error.message)
         },

        });
        
        return {follow,isPending};
};

export default useFollow;