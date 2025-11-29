'use client'

import { useConvexMutation } from '@/hooks/use-convex-mutation';
import { useConvexQuery } from '@/hooks/use-convex-query';
import React from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { api } from '@/convex/_generated/api'
import EventCard from '@/components/event-card';
import { toast } from 'sonner';

const MyEvents = () => {
  
  const router= useRouter();
  const {data:events,isLoading}=useConvexQuery(api.event.getMyEvents)
  const {mutate:deleteEvent}=useConvexMutation(api.event.deleteEvent)

  const handleDeleteEvent = async(eventId) => {
    if(!window.confirm("Are you sure you want to delete this event")){
      return ;
    }

    try{
      await deleteEvent({eventId});
      toast.success("Event deleted successfully")
    }catch(err){
        toast.error(err.message || "Failed to delete event")
    }
  }

  const handleClickEvent = (eventId) => {
    router.push(`/my-events/${eventId}`)
  }

  if(isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-20 px-4">
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2'>My Events</h1>
          <p className='text-muted-foreground'>Manage your created events</p>
        </div>
        
        {
          events?.length === 0 ? (
            <Card className="p-12 text-center">
              <div className='max-w-md mx-auto space-y-4'>
                <h2 className='text-2xl font-semibold'>No Events Found</h2>
                <p className='text-muted-foreground'>
                  Create your first event to get started
                </p>
                <Button asChild className="gap-2">
                  <Link href="/create-event"> 
                    Create Your First Event
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {
                events?.map((event) => (
                  <EventCard 
                    key={event._id}
                    event={event}
                    actions="event"
                    onClick={() => handleClickEvent(event._id)}
                    onDelete={() => handleDeleteEvent(event._id)}
                  />
                ))
              }
            </div>
          )
        }
      </div>
    </div>
  )
}

export default MyEvents
