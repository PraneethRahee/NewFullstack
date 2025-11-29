'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

const ExploreLayout = ({children}) => {

  const pathname = usePathname();
  const router = useRouter();
  const isExplore = pathname === '/explore';

  return (
    <div className='pb-16 min-h-screen'>
      <div className="max-w-7xl mx-auro px-6">
        {
          !isExplore && (
            <div className='mb-6'>
              <Button variant="ghost" className='gap-2 -ml-2' onClick={()=>router.push('/explore')}>
                <ArrowLeftIcon className='w-4 h-4' />
                Back to Explore
              </Button>
            </div>
          )
        }
        {children}
      </div>
    </div>
  )
}

export default ExploreLayout