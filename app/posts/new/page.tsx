import { AppShell } from "@/components/app-shell";
import { PostEditor } from "@/components/post-editor";
import { requireOwner } from "@/lib/auth";

export default async function NewPost() {
  await requireOwner();
  return <AppShell><PostEditor /></AppShell>;
}
