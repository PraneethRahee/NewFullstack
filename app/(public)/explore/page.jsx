'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useConvexQuery } from '@/hooks/use-convex-query'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { createLocationSlug } from '@/lib/location-utils'
import { Loader2 } from 'lucide-react'
import EventCard from '@/components/event-card'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES } from '@/lib/data'

const ExplorePage = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const {data:currentuser}=useConvexQuery(api.users.getCurrentUser);
  
  const { data:featuredEvents, error, isLoading:loadingFeatured } = useConvexQuery(api.events.getFeaturedEvents,{limit:3});
  
  const {data:localEvents, isLoading:loadingLocal} = useConvexQuery(api.events.getEventsByLocation,
    {
      city:currentuser?.location?.city || "",
      state:currentuser?.location?.state || "",
      limit:4
    });

  const {data:popularEvents, isLoading:loadingPopular} = useConvexQuery(api.events.getPopularEvents,{limit:6});

  const {data:categoryCounts, isLoading:loadingCategoryCounts} = useConvexQuery(api.events.getCategoryCounts);

  const plugin = useRef(Autoplay({
    delay:200,stopOnInteraction:false
  }));

  const categoriesWithCounts = CATEGORIES.map((category)=>{
    return {
      ...category,
      count:categoryCounts?.[category.id] || 0
    }
  })

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Handle case where user is not found in database (new user)
  if (!currentuser && isClient) {
    // For new users, show a message to complete onboarding
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to EventHub!</h2>
          <p className="text-muted-foreground mb-6">
            Please complete your profile to get started with creating events.
          </p>
          <Button asChild>
            <Link href="/onboarding">Complete Profile</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleClick = (slug)=>{
    router.push(`/events/${slug}`);
  }

  const handleViewLocalEvents = ()=>{
    const city=currentuser?.location?.city || "Gurugram"
    const state=currentuser?.location?.state || "Haryana"

    const slug = createLocationSlug(city,state);
    router.push(`/explore/${slug}`);
  }

  const handleBrowseCategory = (categoryId)=>{
    router.push(`/explore/${categoryId}`);
  }
  const isLoading = loadingFeatured || loadingLocal || loadingPopular || loadingCategoryCounts;

  if(isLoading){
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <>
      <div className="pb-12 text-center">
        <h1 className='text-5xl md:text-6xl font-bold mb-4'>Discover Events</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {"Explore featured events, find what's happening near you, and browse events across India."}
        </p>
      </div>

      {featuredEvents && featuredEvents.length > 0 && (
        <div className="mb-16">
          <Carousel className="w-full" plugins={[plugin.current]} 
            onMouseEnter={()=>plugin.current.stop()} 
            onMouseLeave={()=>plugin.current.reset()}
          >
            <CarouselContent> 
              {
                featuredEvents.map((event)=>(
                  <CarouselItem key={event._id}>
                    <div onClick={()=>handleClick(event.slug)}
                      className='relative cursor-pointer overflow-hidden rounded-xl h-[400px]'
                    >
                      {
                        event.coverImage ? (<Image src={event.coverImage} alt={event.title} fill className='object-cover' priority/>):
                        (<div className='absolute inset-0' style={{backgroundColor:event.themeColor}}></div>)
                      }

                      <div className="absolute inset-0 bg-linear-to-r from-black/60 to-black/30"></div>
                      <div className='relative h-full flex flex-col justify-end p-8 md:p-12'>
                        <Badge variant="secondary" className='mb-4 w-fit'>
                          {event.city}, {event.state || event.country}
                        </Badge>
                        <h2 className="text-3xl md:text-5xl font-bold mb-3 text-white">
                          {event.title}
                        </h2>
                        <p className="text-lg mb-4 text-white/90 max-w-2xl line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-white/80">
                          <div className="flex items-center gap-2">
                            <Calendar className='w-4 h-4' />
                            <span className='text-sm'>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className='w-4 h-4' />
                            <span className='text-sm'>{event.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className='w-4 h-4' />
                            <span className='text-sm'>{event.registrationCount} registered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              }
            </CarouselContent>
            <CarouselPrevious className="left-4"/>
            <CarouselNext className="right-4"/>
          </Carousel>
        </div>
      )}

      {
        localEvents && localEvents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-1">Evnts Near You</h2>
                <p className="text-muted-foreground">
                  Happening in {currentuser?.location?.city || "your area"}
                </p>
              </div>
              <Button variant="outline" className="gap-2" onClick={handleViewLocalEvents}>
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {
                localEvents.map((event)=>(
                  <EventCard key={event._id} event={event} variant="grid" onClick={()=>handleClick(event.slug)}/>
                ))
              }
            </div>
          </div>
        )
      }

      <div className='mb-16'>
        <h2 className="text-3xl font-bold mb-6">
          Browse By Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {
            categoriesWithCounts.map((category)=>(
              <Card key={category.id} className='py-2 group cursor-pointer hover:shadow-lg transition-all hover:border-purple-500/50' onClick={()=>handleBrowseCategory(category.id)}>
                <CardContent className='px-3 sm:p-6 flex items-center gap-3'>
                  <div className='text-3xl sm:text-4xl'>{category.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 group-hover:text-purple-500 transition-colors">{category.label}</h3>
                    <p className='text-sm text-muted-foreground'>{category.count} Event{category.count === 1 ? "": "s"}</p>
                  </div>
                  
                </CardContent>
              </Card>
            ))
          }
        </div>
      </div>

      {
        popularEvents && popularEvents.length > 0 && (
          <div className='mb-16'>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-1">Popular Across India</h2>
              <p className="text-muted-foreground">Trending events from across India</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {
                popularEvents.map((event)=>(
                  <EventCard key={event._id} event={event} variant="list" onClick={()=>handleClick(event.slug)}/>
                ))
              }
            </div>
          </div>
        )
      }


      {!loadingFeatured && !loadingLocal && !loadingPopular && (!featuredEvents || featuredEvents.length === 0) && (!localEvents && localEvents.length === 0) && (!popularEvents && popularEvents.length === 0) && (
        <Card className='p-12 text-center'>
          <div className="max-w-md mx-auto space-y-4">
            <div className='text-6xl mb-4'></div>
            <h2 className="text-2xl font-bold">No Events Found</h2>
            <p className="text-muted-foreground">{"We couldn't find any events matching your search criteria."}</p>
            <Button asChild className="gap-2">
              <a href="/create-event">
                CreateEvent
              </a>
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}

export default ExplorePage
