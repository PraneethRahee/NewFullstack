import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Sparkle } from 'lucide-react'
import { PricingTable } from '@clerk/nextjs'

const UpgradeModel = ({isOpen, onClose, trigger, onUpgrade}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkle className="h-6 w-6 text-purple-500" />
            <DialogTitle>Upgrade to Pro</DialogTitle>
          </div>
            
            <DialogDescription>
              {
                trigger === "header" && "Create Unlimited Events with Pro!"
              }
              {
                trigger === "limit" && "You've reached the limit of your free plan. Upgrade to Pro to continue creating events."
              }
              {
                trigger === "color" && "Custom theme colors are a Pro feature!"
              }
              Unlock unlimited events and premium features!
            </DialogDescription>
          </DialogHeader>
          <PricingTable
            checkoutProps={{
              appearance:{
                elements:{
                  drawerRoot:{
                    zIndex:2000
                  }
                }
              }
            }}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Maybe Later</Button>
            <Button onClick={onUpgrade} className="flex-1">Upgrade Now</Button>
          </div>
        </DialogContent>
    </Dialog>
  )
}

export default UpgradeModel
