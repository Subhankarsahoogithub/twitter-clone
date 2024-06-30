import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";
import { useQuery } from '@tanstack/react-query'
import { useEffect } from "react";


const Posts = ({feedType}) => {
	

	//function to handle following feed:
	const getPostEndpoint= () => {
          switch(feedType){
			case "forYou" :
				 return "api/posts/all";
			case "following":
				 return "api/posts/following";
			default :
			      return "api/posts/all";
		  }
	}

	const POST_ENDPOINT=getPostEndpoint();

	//fetch the posts:
	const {data:posts,isLoading,refetch,isRefetching} = useQuery({
		queryKey:["posts"],
		queryFn: async ()=>{
           try {
			 //make a get request:
			 const res=await fetch(POST_ENDPOINT);
			 //retrive the data:
			 const data=await res.json();

			 //invalid response:
			 if(!res.ok) throw new Error(data.error || "something went wrong:");

			 //return:
			 return data;

		   } catch (error) {
			  throw new Error(error);
		   }
		}
	})

	//refetch whenever the feedType is changed:
	useEffect(()=>{
       refetch();
	},[feedType,refetch])

	return (
		<>
			{isLoading && isRefetching && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;
