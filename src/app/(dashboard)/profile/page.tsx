import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/forms/ProfileForm"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>
      <ProfileForm initialName={session.user.name} email={session.user.email} />
    </div>
  )
}
