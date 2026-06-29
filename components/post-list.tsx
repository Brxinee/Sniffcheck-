import type { Post } from "@prisma/client";

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <article key={post.id} className="glass rounded-3xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[.3em] text-primary">{post.status}</p>
              <h2 className="mt-2 text-xl font-black">{post.title}</h2>
            </div>
            <p className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">{post.scheduledAt?.toLocaleString() ?? "Unscheduled"}</p>
          </div>
          <p className="mt-4 line-clamp-3 text-white/65">{post.body}</p>
          {post.lastError ? <p className="mt-3 rounded-2xl bg-red-500/15 p-3 text-sm text-red-200">{post.lastError}</p> : null}
        </article>
      ))}
      {posts.length === 0 ? <p className="glass rounded-3xl p-8 text-center text-white/55">No posts found.</p> : null}
    </div>
  );
}
