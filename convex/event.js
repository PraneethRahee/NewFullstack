import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { query } from "./_generated/server";

export const createEvent = mutation({
  args:{
    title:v.string(),
    description:v.string(),
    category:v.string(),
    tags:v.array(v.string()),

    startDate:v.number(),
    endDate:v.number(),
    timezone:v.string(),
    
    locationType:v.union(v.literal("physical"),v.literal("online")),
    venue:v.optional(v.string()),
    address:v.optional(v.string()),
    city:v.string(),
    state:v.optional(v.string()),
    country:v.string(),
    
    capacity:v.number(),
    ticketType:v.union(v.literal("free"),v.literal("paid")),
    ticketPrice:v.optional(v.number()),
    coverImage:v.optional(v.string()),
    themeColor:v.optional(v.string()),
  },
  handler:async(ctx,args)=>{
    try{
      const user = await ctx.runQuery(internal.users.getCurrentUser);

      // Use hasPro from user object instead of args
      if(!user.hasPro && user.freeEventsCreated >= 5){
        throw new Error("You've reached the limit of your free plan. Upgrade to Pro to continue creating events.");
      }

      const defaultColor="#1e3a8a";
      if(!user.hasPro && args.themeColor && args.themeColor !== defaultColor){
        throw new Error("Custom theme colors are a Pro feature!");
      }

      const themeColor = user.hasPro ? args.themeColor : defaultColor;

      const baseSlug=args.title.toLowerCase().replace(/\s+/g,"-").replace(/(^-|-$)/g,"");

      const eventId = await ctx.db.insert("events",{
          title: args.title,
          description: args.description,
          category: args.category,
          tags: args.tags,
          startDate: args.startDate,
          endDate: args.endDate,
          timezone: args.timezone,
          locationType: args.locationType,
          venue: args.venue,
          address: args.address,
          city: args.city,
          state: args.state,
          country: args.country,
          capacity: args.capacity,
          ticketType: args.ticketType,
          ticketPrice: args.ticketPrice,
          coverImage: args.coverImage,
          themeColor:themeColor,
          slug:`${baseSlug}-${Date.now()}`,
          organizerId:user._id,
          organizerName:user.name,
          registrationCount:0,
          createdAt:Date.now(),
          updatedAt:Date.now(),
        });

        await ctx.db.patch(user._id,{
          freeEventsCreated: user.freeEventsCreated + 1,
        })

        return eventId;
    }
    catch(error){
      console.error("Error creating event:", error);
      throw new Error("Failed to create event");
    }
  }

})


export const getEventBySlug = query({
  args:{
    slug:v.string(),
  },
  handler:async(ctx,args)=>{
    const event = await ctx.db.query("events").withIndex("by_slug",(q)=>q.eq("slug",args.slug)).unique();
    if(!event){
      throw new Error("Event not found");
    }
    return event;
  }
})

export const getMyEvents = query({
  handler:async(ctx)=>{
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    if(!user){
      throw new Error("Unauthorized User");
    }
    const events = await ctx.db.query("events").withIndex("by_organizer",(q)=>q.eq("organizerId",user._id)).order("desc").collect();
    return events;
  }
})


export const deleteEvent = mutation({
  args:{
    eventId:v.id("events"),
  },
  handler:async(ctx,args)=>{
    try{
      const user = await ctx.runQuery(internal.users.getCurrentUser);
      if(!user){
        throw new Error("Unauthorized");
      }

      const event = await ctx.db.get(args.eventId);
      if(!event){
        throw new Error("Event not found");
      }
      if(event.organizerId !== user._id){
        throw new Error("Unauthorized");
      }

      const registrations = await ctx.db.query("registrations").withIndex("by_event",(q)=>q.eq("eventId",args.eventId)).collect();

      for(const registration of registrations){
        await ctx.db.delete(registration._id);
      }
      await ctx.db.delete(args.eventId);

      if(user.freeEventsCreated > 0){
        await ctx.db.patch(user._id,{
          freeEventsCreated: user.freeEventsCreated - 1,
        })
      }
      return { success: true };
    }
    catch(error){
      throw new Error("Failed to delete event");
    }
  }
})