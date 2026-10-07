import LoginForm from "@/components/admin/blog/LoginForm";
import { blogConfigured } from "@/lib/config/blog-env";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="blog-login">
      <h1>A space to write.</h1>
      <p>Sign in to draft, preview, and publish your articles.</p>
      {error && (
        <p role="alert">
          That sign-in link expired or could not be verified. Sign in with your
          password or request a new link below.
        </p>
      )}
      {blogConfigured() ? (
        <LoginForm />
      ) : (
        <p>
          Blog setup is incomplete. Configure Supabase using{" "}
          <code>docs/blog-setup.md</code>, then return here.
        </p>
      )}
    </div>
  );
}
