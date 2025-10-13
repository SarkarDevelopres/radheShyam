import LiveView from "./LiveView";

async function getPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/odds/live`, { cache: "no-store" }); // SSR
  const req = await res.json();
  console.log("Result: ",req);
  
  return req;
  
}

export default async function InPlay() {
    const posts = await getPosts();
    
    return <LiveView initialData={posts} />
}