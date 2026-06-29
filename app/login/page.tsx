import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export default function Login() {
  async function action(formData: FormData) {
    "use server";
    if (await login(String(formData.get("email")), String(formData.get("password")))) redirect("/dashboard");
    redirect("/login?error=1");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={action} className="glass w-full max-w-sm rounded-3xl p-8">
        <p className="text-primary">SmelloffIndia</p>
        <h1 className="mt-2 text-3xl font-black">Owner login</h1>
        <input name="email" type="email" placeholder="Email" className="mt-8 w-full rounded-xl bg-white/10 p-3" required />
        <input name="password" type="password" placeholder="Password" className="mt-3 w-full rounded-xl bg-white/10 p-3" required />
        <button className="mt-6 w-full rounded-xl bg-primary p-3 font-bold text-black">Sign in</button>
      </form>
    </main>
  );
}
