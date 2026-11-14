import {useCallback,useEffect,useState} from 'react';
import {initialSchedule} from './task_schedule.js';

const key='agent-harness.task-schedule.v1';
function read() {
  const raw=localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}
// 比较页的三个同源窗口共用此锁，写入前重读，避免同时调整时覆盖其他安排。
function exclusive(action) {
  return navigator.locks ? navigator.locks.request(key, action) : Promise.resolve().then(action);
}
export function useTaskSchedule(active) {
  const [schedule,setSchedule]=useState(()=>read()??initialSchedule());
  const [error,setError]=useState('');
  useEffect(()=>{
    const refresh=event=>{if(event.key===key||event.key===null) setSchedule(read()??initialSchedule());};
    window.addEventListener('storage',refresh);
    if(active) exclusive(()=>{
      const current=read();
      if(current) setSchedule(current);
      else {const first=initialSchedule();localStorage.setItem(key,JSON.stringify(first));setSchedule(first);}
    }).catch(e=>setError(e.message));
    return ()=>window.removeEventListener('storage',refresh);
  },[active]);
  const save=useCallback(operation=>exclusive(()=>{
    const next=operation(read()??initialSchedule());
    localStorage.setItem(key,JSON.stringify(next));
    setSchedule(next);
    setError('');
  }),[]);
  return {schedule,save,error};
}
