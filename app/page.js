import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
const page = () => {
  return (
    <div>
      <section className="pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className='text-center sm:text-left'>
            <span className='font-light tracking-wide text-gray-500'>
              EventHub 
              <span className='text-purple-400'>*</span>
            </span>
            <h1 className='text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[0.95]'>
              Discover &<br/>
              create amazing
              <br />
              <span className='bg-linear-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent'>
                event.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-lg font-light">
              {" "}
              Whether you&apos;re hosting or attending, Spott makes every event memorable.Join our community today.
            </p>

            <Link href="/explore"> 
              <Button size="xl" className={"rounded-full"}>Get Started</Button> 
            </Link>
          </div>

          <div>
            <Image 
              src="/Heros.jpg" 
              alt="hero" 
              width={700} 
              height={700} 
              className="w-full max-w-[700px] aspect-square rounded-full object-cover" 
              priority
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default page
