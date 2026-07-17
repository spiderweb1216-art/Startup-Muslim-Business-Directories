import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const KEY='sm_saved_guest_v2';
const EMPTY={startups:[],pitches:[],investors:[],founders:[],opportunities:[],jobs:[],follows:[]};
const SavedContext=createContext(null);

export const SavedProvider=({children})=>{
  const {currentUser}=useAuth();
  const currentUserId=currentUser?.id||'';
  const [saved,setSaved]=useState({...EMPTY});

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      if(currentUserId){
        try{const result=await api('/saved');if(active)setSaved({...EMPTY,...result.saved});}
        catch{if(active)setSaved({...EMPTY});}
      }else{
        try{const raw=localStorage.getItem(KEY);if(active)setSaved(raw?{...EMPTY,...JSON.parse(raw)}:{...EMPTY});}catch{if(active)setSaved({...EMPTY});}
      }
    };
    load();return()=>{active=false;};
  },[currentUserId]);

  useEffect(()=>{if(!currentUserId){try{localStorage.setItem(KEY,JSON.stringify(saved));}catch{}}},[saved,currentUserId]);

  const toggle=useCallback((type,id)=>{
    setSaved(prev=>{const list=prev[type]||[];const exists=list.includes(id);return{...prev,[type]:exists?list.filter(x=>x!==id):[...list,id]};});
    if(currentUserId)api('/saved/toggle',{method:'POST',body:{itemType:type,itemKey:id}}).catch(console.error);
  },[currentUserId]);
  const isSaved=useCallback((type,id)=>(saved[type]||[]).includes(id),[saved]);
  return <SavedContext.Provider value={{saved,toggle,isSaved}}>{children}</SavedContext.Provider>;
};
export const useSaved=()=>useContext(SavedContext);
