import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SignedOut, SignedIn, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { Button } from './ui/button'
const Header = () => {
  return (
    <>
      <nav className='fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-xl border-b '>
        <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
          <Link href="/" className='flex items-center'>
            <Image src="/logo.svg" alt="logo" width={500} height={500} className='h-11' priority/>
          </Link>
          <div className='flex items-center'>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode='modal' >
                <Button size="sm">Sign In</Button>
              </SignInButton>  
            </SignedOut>
            
          </div>
        </div>

      </nav>
    </>
  )
}

export default Header
