"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { api } from "@/trpc/client"
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations/auth.schema"

type UpdateProfileInput = z.infer<typeof updateProfileSchema>
type ChangePasswordInput = z.infer<typeof changePasswordSchema>

interface ProfileFormProps {
  initialName: string | null | undefined
  email: string | null | undefined
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: initialName ?? "" },
  })

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const updateProfile = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      setProfileError(null)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    },
    onError: (err) => {
      setProfileError(err.message)
    },
  })

  const changePassword = api.auth.changePassword.useMutation({
    onSuccess: () => {
      setPasswordSuccess(true)
      setPasswordError(null)
      passwordForm.reset()
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: (err) => {
      setPasswordError(err.message)
    },
  })

  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
        <form
          onSubmit={profileForm.handleSubmit((data) => updateProfile.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email ?? ""}
              readOnly
              className="w-full rounded border bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              {...profileForm.register("name")}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {profileForm.formState.errors.name && (
              <p className="text-xs text-red-600">
                {profileForm.formState.errors.name.message}
              </p>
            )}
          </div>
          {profileError && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-600">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="rounded bg-green-50 p-2 text-sm text-green-700">
              Profile updated successfully
            </p>
          )}
          <Button
            type="submit"
            disabled={profileForm.formState.isSubmitting || updateProfile.isPending}
          >
            Save Changes
          </Button>
        </form>
      </section>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
        <form
          onSubmit={passwordForm.handleSubmit((data) => changePassword.mutate(data))}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              {...passwordForm.register("currentPassword")}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              {...passwordForm.register("newPassword")}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-xs text-red-600">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>
          {passwordError && (
            <p className="rounded bg-red-50 p-2 text-sm text-red-600">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="rounded bg-green-50 p-2 text-sm text-green-700">
              Password changed successfully
            </p>
          )}
          <Button
            type="submit"
            disabled={passwordForm.formState.isSubmitting || changePassword.isPending}
          >
            Change Password
          </Button>
        </form>
      </section>
    </div>
  )
}
