"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useMemo } from "react"
import { Progress } from "./ui/progress"
import { Heart, MapPin } from "lucide-react"
import { Badge } from "./ui/badge"
import { CATEGORIES } from "@/lib/data"
import { useConvexMutation } from "@/hooks/use-convex-mutation"
import { api } from "@/convex/_generated/api"
import { State, City } from "country-state-city";
import { toast } from "sonner"

export default function OnboardingModel({isOpen, onClose, onComplete}) {

  const [step,setStep]=useState(1); 
  const [selectedInterests,setSelectedInterests]=useState([]); 
  const [location,setLocation]=useState({
    state:"",
    city:"",
    country:"India",
  });

  const {mutate:completeOnboarding,isLoading} = useConvexMutation(api.users.completeOnboarding);

  const indianStates = State.getStatesOfCountry("IN");

  const cities = useMemo(() =>{
    if(!location.state) return [];
    const selectedState = indianStates.find((s)=>s.name.toLowerCase() === location.state.toLowerCase());

    if(!selectedState) return [];
    return City.getCitiesOfState("IN", selectedState.isoCode);
  },[location.state,indianStates]);

  const progress = (step / 2) * 100;

  const toggleInterest = (interestId) => {
    setSelectedInterests((prev)=>
      prev.includes(interestId) ? prev.filter((id)=>id!==interestId) : [...prev,interestId]
    );
  };

  const handleComplete = async() => {
    try{
      await completeOnboarding({
        location:{
          city:location.city,
          state:location.state,
          country:location.country,
        },
        interests:selectedInterests,
      })
      toast.success("Onboarding completed successfully");
      onComplete();
    }catch(error){
      toast.error(error.message);
    }
  }

  const handleNext =  () => {
    if(step===1 && selectedInterests.length<3){
      toast.error("Please select atleast 3 interests");
      return;
    }
    if(step===2 && (!location.state || !location.city)){
      toast.error("Please select a location");
      return;
    }
    
    if(step < 2){
      setStep(step+1);
    }else{
      handleComplete();
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="mb-4">
              <Progress
                value={progress}
                className="h-1"
              />
            </div>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {
                step===1 ? (
                  <>
                    <Heart className="w-6 h-6 text-purple-500" />
                    What interests you?
                  </>
                ):(
                  <>
                    <MapPin className="w-6 h-6 text-purple-500" />
                    Where are you located?
                  </>
                )
              }
            </DialogTitle>
            <DialogDescription>
              {
                step===1 ? (
                  "Select atleast 3 interests that you are interested in."
                ):(
                  "We will show you events in your location."
                )
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {
              step===1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-2">
                      {
                        CATEGORIES.map((category)=>(
                          <button key={category.id} 
                            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedInterests.includes(category.id) ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20" : "border-border hover:border:purple-300"}`} 
                            onClick={()=> toggleInterest(category.id)}
                            >
                            <div className="text-2xl mb-2">{category.icon}</div>
                            <div className="text-sm font-medium">{category.label}</div>
                          </button>
                        ))
                      }
                  </div>
                  
                  <div className="flex items-center gap-2">
                      <Badge variant={selectedInterests.length>=3 ? "default" : "secondary" } >
                        {selectedInterests.length} selected
                      </Badge>
                      {
                        selectedInterests.length>=3 && (
                          <span className="text-sm text-green-500">Ready to Continue</span>
                        )               
                      }
                  </div>
                </div>
              )
            }
            {
              step===2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select value={location.state} onValueChange={(value)=>setLocation({...location,state:value,city:""})}>
                        <SelectTrigger id="state" className="w-full h-11">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent>
                          {indianStates.map((state)=>(
                            <SelectItem key={state.isoCode} value={state.name}>{state.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Select value={location.city} onValueChange={(value)=>setLocation({...location,city:value})} disabled={!location.state}>
                        <SelectTrigger id="city" className="w-full h-11">
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                        {
                          cities.length > 0 ? (
                            cities.map((city)=>(
                              <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-cities" disabled>No cities found</SelectItem>
                          )
                        }
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {
                    location.state && location.city && (
                      <div className="p-4 bg-purple-500/10 rounded-lg border-2 border-purple-500/20">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-6 h-6 text-purple-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Your Location</p>
                            <p className="text-sm text-muted-foreground">{location.city}, {location.state}, {location.country}</p>
                          </div>
                        </div>
                      </div>
                    )
                  }
                </div>
              )
            }
          </div>
          <DialogFooter className="flex gap-3">
            {
              step>1 && (
                <Button variant="outline" className="gap-2" onClick={()=>setStep(step-1)}>Back</Button>
              )
            }
            {/* <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose> */}
            <Button className="flex-1 gap-2" disabled={isLoading} onClick={handleNext}>{isLoading ? "Completing..." : step===2 ? "Complete Setup" : "Save and Continue"}</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
