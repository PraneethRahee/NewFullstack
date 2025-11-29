'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useConvexQuery } from '@/hooks/use-convex-query'
import { api } from '@/convex/_generated/api'
import { useConvexMutation } from '@/hooks/use-convex-mutation'
import { State, City } from 'country-state-city'
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { getCategoryIcon } from '@/lib/data'
import { format } from 'date-fns'
import { MapPin, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { createLocationSlug } from '@/lib/location-utils'
const SearchLocationBar = () => {

  const router = useRouter();
  const [searchQuery,setSearchQuery] = useState('');
  const [showSearchResults,setShowSearchResults] = useState(false);
  const [selectedState,setSelectedState] = useState("");
  const [selectedCity,setSelectedCity] = useState("");

  const searchRef = useRef(null);


  const {data:currentUser,isLoading} = useConvexQuery(api.users.getCurrentUser);
  const {mutate:updateLocation} = useConvexMutation(api.users.completeOnboarding);

  const {data:searchResults,isLoading:searchLoading} = useConvexQuery(api.search.searchEvents,searchQuery.trim().length>=2 ? {query:searchQuery,limit:5} : "skip");
  
  const indianStates = State.getStatesOfCountry("IN");

  const cities = useMemo(()=>{
    if(!selectedState) return [];
    const state = indianStates.find((s)=>s.name.toLowerCase() === selectedState.toLowerCase());

    if(!state) return [];
    return City.getCitiesOfState("IN", state.isoCode);
  },[selectedState,indianStates]);
  
  useEffect(()=>{
    if(currentUser?.location){
      setSelectedState(currentUser.location.state||"");
      setSelectedCity(currentUser.location.city||"");
    }
  },[currentUser,isLoading]);

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }


  const debouncedSetQuery = useRef(
    debounce((value) => setSearchQuery(value), 300)
  ).current;

  const handleSearchChange = (value) => {
    
    setSearchQuery(value);
    debouncedSetQuery(value)
    setShowSearchResults(value.length>=2);
  }

  const handleSearchResultClick = (slug)=>{
    setShowSearchResults(false);
    setSearchQuery("");
    router.push(`/events/${slug}`);
  }

  useEffect(()=>{
    const handleClickOutside = (e)=>{
      if(searchRef.current && !searchRef.current.contains(e.target)){
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown",handleClickOutside);
    return ()=>document.removeEventListener("mousedown",handleClickOutside);
  })

  const handleLocationSelect = async(city,state)=>{
    try{
      if(currentUser?.interests && currentUser?.location){
        await updateLocation({
          location:{
            city,
            state,
            country:"India",
          },
          interests:currentUser.interests,
        });
        
        const slug = createLocationSlug(city,state);
        router.push(`/explore/${slug}`);
      }
    }catch(error){
      console.error("Error selecting location:",error);
    }
  }
  return (
    <div className="flex items-center">
      <div className="relative flex w-full" ref={searchRef}>
        <div className="flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input placeholder="Search for events"
            onFocus={()=>{if(searchQuery.length>=2){setShowSearchResults(true)}}}
            onChange={(e)=>handleSearchChange(e.target.value)}
            className="pl-10 w-full h-9 rounded-none rounded-l-md"/>
        </div>
        {
          showSearchResults && (
            <div className="absolute top-full mt-2 w-96 bg-background border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
              {
                searchLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="py-2">
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground">Search Results</p>
                    {
                      searchResults.map((event)=>(
                        <button key={event._id} 
                          className="w-full text-left px-4 py-2 hover:bg-muted/50 transition-colors cursor-pointer" 
                          onClick={()=>handleSearchResultClick(event.slug)}>
                          <div className="flex items-start gap-3">
                            <div className="text-2xl mt-0.5">
                              {
                                getCategoryIcon(event.category)
                              }
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className="font-medium mb-1 line-clamp-1">{event.title}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className='flex items-center gap-1'>
                                  <Calendar className='w-4 h-4' />{format(event.startDate, 'MMM dd')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className='w-4 h-4' />{event.city}
                                </span>
                              </div>
                            </div>
                            {
                              event.ticketType==="free" && (
                                <Badge variant="secondary" className='text-xs'>
                                  Free
                                </Badge>
                              )
                            }
                          </div>
                        </button>
                      ))}
                    
                  </div>
                ):null
              }
            </div>
          )
        }
      </div>

      <Select
        value={selectedState}
        onValueChange={(value)=>{
          setSelectedState(value)
          setSelectedCity("")
          }}
      >
        <SelectTrigger className='w-32 h-9 border-l-0 rounded-none'>
          <SelectValue placeholder='Select State' />
        </SelectTrigger>
        <SelectContent>
          {
            indianStates.map((state)=>(
              <SelectItem key={state.isoCode} value={state.name}>{state.name}</SelectItem>
            ))
          }
        </SelectContent>
      </Select>

      <Select
        value={selectedCity}
        onValueChange={(value)=>{
          setSelectedCity(value)
          if(value && selectedState){
            handleLocationSelect(value,selectedState);
          }
        }}
        disabled={!selectedState}
      >
        <SelectTrigger className='w-32 h-9 border-l-0 rounded-none'>
          <SelectValue placeholder='Select City' />
        </SelectTrigger>
        <SelectContent>
          {
            cities.map((city)=>(
              <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
            ))
          }
        </SelectContent>
      </Select>
    </div>
  )
}

export default SearchLocationBar
