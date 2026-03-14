import { TRPCError } from "@trpc/server"
import bcrypt from "bcryptjs"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/trpc"
import { db } from "@/server/db"
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations/auth.schema"

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session
  }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input.name },
      })
      return user
    }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.findUniqueOrThrow({
        where: { id: ctx.session.user.id },
      })
      if (!user.hashedPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account does not use password authentication",
        })
      }
      const isValid = await bcrypt.compare(input.currentPassword, user.hashedPassword)
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        })
      }
      const hashedPassword = await bcrypt.hash(input.newPassword, 12)
      await db.user.update({
        where: { id: user.id },
        data: { hashedPassword },
      })
      return { success: true }
    }),
})
