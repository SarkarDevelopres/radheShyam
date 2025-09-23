import ClientView from "./ClientView";

async function getPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/odds/cricket`, { cache: "no-store" }); // SSR
  const req = await res.json();
  console.log("Result: ",req);
  
  return req;
  
}

export default async function Sports() {
    const posts = await getPosts();
    
    return <ClientView initialData={posts} />
}