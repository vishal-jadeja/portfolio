import { createDraftAction } from "@/lib/blog/actions";
import { requireOwner } from "@/lib/blog/auth";
export default async function New() {
  await requireOwner(true);
  return (
    <>
      <h1>Start an article.</h1>
      <form action={createDraftAction}>
        <button className="blog-button">Create draft</button>
      </form>
    </>
  );
}
