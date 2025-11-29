'use client'
import React, { useState, useMemo } from 'react'
import { useConvexQuery } from '@/hooks/use-convex-query'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'
import { useConvexMutation } from '@/hooks/use-convex-mutation'
import { Loader2, Ticket } from 'lucide-react'
import EventCard from '@/components/event-card'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Dialog, DialogHeader,DialogContent, DialogTrigger } from '@/components/ui/dialog'
import QRCode from 'react-qr-code'


const MyTicketPage = () => {

  const [selectedRegistration,setSelectedRegistration] = useState(null);
  const router = useRouter();
  
  const { data: registrations, isLoading } = useConvexQuery(api.registration.getMyRegistrations);
  
  const {mutate:cancelRegistration,isLoading:isCancelling} = useConvexMutation(api.registration.cancelRegistration);
  
  const upcomingEvents = useMemo(() => {
    return registrations?.filter((registration) => {
      return registration.event && new Date(registration.event.startDate) >= new Date() &&registration.status === "confirmed";
    });
  }, [registrations]);

  const pastEvents = useMemo(() => {
    return registrations?.filter((registration) => {
      return registration.event &&new Date(registration.event.startDate) < new Date() ||registration.status === "cancelled";
    });
  }, [registrations]);

  const handleCancelEvent = async(registrationId) =>{
    if(!window.confirm("Are you sure you want to cancel this registration")){
      return ;
    }

    try{
      await cancelRegistration({registrationId});
      toast.success("Registration cancelled successfully")
    }catch(err){
        toast.error(err.message || "Failed to cancel Registration")
    }
  }
  
  if(isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }
  return (
    <div className='min-h-screen pb-20 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2'>My Tickets</h1>
          <p className='text-muted-foreground'>Manage your event tickets and view your registration history.</p>
        </div>
        {
          upcomingEvents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Upcoming Events
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                  upcomingEvents.map((registration)=>(
                    <EventCard key={registration._id} event={registration.event} actions="ticket"
                      onClick={()=>setSelectedRegistration(registration)}
                      onDelete={()=>handleCancelEvent(registration._id)}/>
                  ))
                }
              </div>
            </div>
          )
        }

        {
          pastEvents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">
                Past Events
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                  pastEvents.map((registration)=>(
                    <EventCard key={registration._id} event={registration.event} actions={null} className='opacity-60'/>
                  ))
                }
              </div>
            </div>
          )
        }

        {
          upcomingEvents?.length===0 && pastEvents.length===0 &&(
            <Card className="p-12 text-center">
              <div className='max-w-md mx-auto space-y-4'>
                <div className='text-2xl font-semibold'>No Ticket Found</div>
                <p className="text-muted-foreground">Register for events to see your tickets here</p>
                <Button asChild className="gap-2">
                  <Link href="/explore">
                    <Ticket className="w-4 h-4"/> Browse Events
                  </Link>
                </Button>
              </div>

            </Card>
          )
        }
      </div> 

      {
        selectedRegistration && (
          <Dialog open={!!selectedRegistration} onOpenChange={()=>setSelectedRegistration(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                Your Ticket
              </DialogHeader>
              <div className="space-y-4">
                <div className='text-center'>
                  <p className="font-semibold mb-1">
                    {selectedRegistration.attendeeName}
                  </p>
                  <p className="font-semibold mb-1">
                    {selectedRegistration.event.title}
                  </p>
                </div>
                <div className="flex justify-center p-6 bg-white rounded-lg">
                  <QRCode value={selectedRegistration.qrCode} size={200} level="H" />
                </div>
                <div className='text-center'>
                  <p className='text-xs text-muted-foreground mb-1'>Ticket ID</p>
                  <p className='font-mono text-sm'>{
                    selectedRegistration.qrCode
                  }</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      }
    </div>
  )
}

export default MyTicketPage
