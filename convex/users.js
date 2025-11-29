import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }


    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      const userUpdates = {};
      if (user.name !== identity.name) {
        userUpdates.name = identity.name ?? "Anonymous";
      }
      if (user.email !== identity.email) {
        userUpdates.email = identity.email ?? "";
      }
      if (user.imageUrl !== identity.pictureUrl) {
        userUpdates.imageUrl = identity.pictureUrl;
      }

      // Add hasPro field if it doesn't exist (for backward compatibility)
      if (user.hasPro === undefined) {
        userUpdates.hasPro = false;
      }

      if (Object.keys(userUpdates).length > 0) {
        userUpdates.updatedAt = Date.now();
        await ctx.db.patch(user._id, userUpdates);
      }

      return user._id;
    }

    return await ctx.db.insert("users", {
      email: identity.email ?? "",
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? "Anonymous",
      imageUrl: identity.pictureUrl,
      hasCompletedOnboarding: false,
      freeEventsCreated: 0,
      hasPro: false, // Add hasPro field with default value of false
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});


export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return null; // Return null instead of throwing an error for new users
    }

    // Provide default value for hasPro if it doesn't exist (for backward compatibility)
    if (user.hasPro === undefined) {
      return {
        ...user,
        hasPro: false,
      };
    }

    return user;
  },
});

export const completeOnboarding = mutation({
  args: {
    location: v.object({
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
    }),
    interests: v.array(v.string()), 
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    await ctx.db.patch(user._id, {
      location: args.location,
      interests: args.interests,
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });
    return user._id;
  },
});

export const upgradeToPro = mutation({
  args: {
    hasPro: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called upgradeToPro without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      hasPro: args.hasPro,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});