import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Migration to rename qrcode field to qrCode in registrations
export const renameQrCodeField = internalMutation({
  handler: async (ctx) => {
    const registrations = await ctx.db.query("registrations").collect();
    
    for (const registration of registrations) {
      if (registration.qrcode) {
        await ctx.db.patch(registration._id, {
          qrCode: registration.qrcode,
          qrcode: undefined, // Remove the old field
        });
      }
    }
  },
});