'use client'

const ATTENDEE_PAGES=["/explore","/my-tickets","/events"];
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useConvexQuery } from "./use-convex-query";
import { api } from "@/convex/_generated/api";

export function useOnboarding() {

  const [showOnboarding, setShowOnboarding] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const {data:currentUser,isLoading}=useConvexQuery(api.users.getCurrentUser);

  useEffect(()=>{
    if(isLoading || !currentUser) return;

    if(!currentUser.hasCompletedOnboarding){
      const requiredSteps = ATTENDEE_PAGES.some(page=>pathname.startsWith(page));

      if(requiredSteps){
        setShowOnboarding(true);
      }
    }
  },[currentUser,isLoading,pathname]);

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    router.push("/")
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    router.refresh();
  }


  return {
    showOnboarding,
    handleOnboardingSkip,
    handleOnboardingComplete,
    setShowOnboarding,
    needsOnboarding:currentUser && !currentUser.hasCompletedOnboarding,
  }
}