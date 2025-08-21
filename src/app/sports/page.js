import ClientView from "./ClientView";

async function getPosts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_PORT}/api/odds/cricket`, { cache: "no-store" }); // SSR
  return res.json();
  
}

export default async function Sports() {
    const posts = await getPosts();
    
    return <ClientView initialData={posts} />
}