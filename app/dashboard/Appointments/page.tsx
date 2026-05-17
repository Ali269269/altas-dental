"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Types ──────────────────────────────────────────────────────────────────────
type ViewMode    = "month" | "week" | "day";
type DisplayMode = "list" | "calendar";
type ModalType   = "none" | "pending" | "addPatient";

// ── Data ──────────────────────────────────────────────────────────────────────
const statCards = [
  { label:"Total Bookings Today",   value:"12", badge:"-12%", badgeType:"negative" },
  { label:"Patients seen (Today)",  value:"7",  badge:null,   badgeType:null },
  { label:"Patients left (Today)",  value:"4",  badge:null,   badgeType:null },
  { label:"No See",                 value:"1",  badge:null,   badgeType:null },
];

const MONTH_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const monthEvents: Record<string,{label:string;color:string}[]> = {
  "1":[{label:"09:00 AM · Mike ...",    color:"gold"}],
  "2":[{label:"10:30 AM · Sarah J...",  color:"blue"},{label:"02:00 PM · David ...",color:"blue"}],
  "3":[{label:"Surgery: Emma W...",     color:"red"}],
  "4":[{label:"11:45 AM · Lunch ...",   color:"red"},{label:"04:00 PM · Rober...",color:"red"}],
  "8":[{label:"08:00 AM · Chec...",     color:"blue"}],
  "10":[{label:"10:00 AM · Sarah ...",  color:"blue"},{label:"11:00 AM · Paul A...",color:"blue"}],
  "17":[{label:"10:00 AM · Sarah ...",  color:"blue"}],
};
const MARCH_OFFSET     = 6;
const MARCH_DAYS_COUNT = 31;

const WEEK_TIMES = ["08:00","10:00","12:00","02:00","04:00","06:00"];
const WEEK_DAYS  = [
  {label:"Mon",date:"07"},{label:"Tue",date:"08"},{label:"Wed",date:"09"},
  {label:"Thu",date:"10"},{label:"Fri",date:"11"},{label:"Sat",date:"12"},{label:"Sun",date:"13"},
];
const weekEvents:{day:number;time:string;label:string;color:string}[] = [
  {day:1,time:"08:00",label:"08:00 AM · Chec...",            color:"blue"},
  {day:1,time:"10:00",label:"10:00 AM · Sarah ...",          color:"blue"},
  {day:1,time:"10:00",label:"11:00 AM · Paul A...",          color:"blue"},
  {day:3,time:"12:00",label:"12:00 PM · Surgery: Emma W...", color:"red"},
  {day:3,time:"02:00",label:"03:00 PM · Surgery: Emma W...", color:"red"},
  {day:4,time:"02:00",label:"02:00 PM · Surgery: Emma W...", color:"gold"},
  {day:1,time:"06:00",label:"06:00 PM · Paul A...",          color:"blue"},
];

const DAY_TIMES_FULL = [
  "08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM",
];
const dayEvents = [
  {time:"09:00 AM",label:"PARODONTOLOGIE",                    name:"Eleanor Shellstrop", color:"blue"},
  {time:"09:30 AM",label:"ALIGNEURS",                         name:"Chidi Anagonye",     color:"gold"},
  {time:"10:00 AM",label:"COMPLEX SURGERY",                   name:"Jason Mendoza",      color:"red"},
  {time:"01:30 PM",label:"Réhabilitation totale du sourire",  name:"Tahani Al Jamil",    color:"green"},
  {time:"04:00 PM",label:"Orthodontic Review",                name:"Janet Dell Tebatso", color:"blue"},
];
const nextUp = {date:"OCT 24",name:"Janet D.",detail:"Consultation · 4:00 PM"};

const upcomingAppointments = [
  {time:"10:45",period:"AM",name:"Robert T. Chen",   type:"Wisdom Tooth Extraction",  status:"CONFIRMED"},
  {time:"02:15",period:"PM",name:"Elena Rodriguez",  type:"Teeth Whitening",           status:"CONFIRMED"},
  {time:"04:00",period:"PM",name:"Marcous Aurelius", type:"Emergency Consultation",    status:"CANCELLED"},
];
const patientsSeen = [
  {time:"10:45",period:"AM",name:"Robert T. Chen",   type:"Wisdom Tooth Extraction",  status:"SEEN"},
  {time:"02:15",period:"PM",name:"Elena Rodriguez",  type:"Teeth Whitening",           status:"SEEN"},
  {time:"04:00",period:"PM",name:"Marcous Aurelius", type:"Emergency Consultation",    status:"SEEN"},
];

const allAppointments = [
  {name:"Eleanor Vance",    id:"#PV-4492",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 02, 10:30 AM",status:"ACTIVE"},
  {name:"Theodore Finch",   id:"#PV-5723",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 02, 1:00 PM", status:"PENDING"},
  {name:"Dorian Gray",      id:"#PV-2684",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 12, 3:30 PM", status:"PENDING"},
  {name:"Holly Golightly",  id:"#PV-5839",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 23, 4:00 PM", status:"PENDING"},
  {name:"Elizabeth Bennet", id:"#PV-7510",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 24, 10:00 AM",status:"PENDING"},
  {name:"Fitzwilliam Darcy",id:"#PV-8921",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 29, 11:30 AM",status:"PENDING"},
  {name:"Sherlock Holmes",  id:"#PV-9864",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 30, 1:45 PM", status:"PENDING"},
  {name:"Sherlock Holmes",  id:"#PV-9864",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 30, 1:45 PM", status:"PENDING"},
  {name:"Sherlock Holmes",  id:"#PV-9864",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 30, 1:45 PM", status:"PENDING"},
  {name:"Sherlock Holmes",  id:"#PV-9864",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 30, 1:45 PM", status:"PENDING"},
  {name:"Sherlock Holmes",  id:"#PV-9864",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 30, 1:45 PM", status:"PENDING"},
  {name:"Sherlock Holmes",  id:"#PV-9864",email:"eleanorvance@gmail.com",  phone:"+971 00 000 0000",specialty:"Aligneurs",lastVisit:"Oct 12, 2023",nextAppt:"Mar 30, 1:45 PM", status:"PENDING"},
];

const pendingConfirmations = [
  {name:"Lucy Van Pelt",      service:"Aligneurs",  date:"Oct 28",timeAgo:"2h ago",   time:"8:30 AM"},
  {name:"Franklin Armstrong", service:"Endodontie", date:"Oct 30",timeAgo:"4h ago",   time:"4:00 PM"},
  {name:"Franklin Armstrong", service:"Endodontie", date:"Oct 30",timeAgo:"Yesterday",time:"10:30 AM"},
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusStyle(status:string){
  switch(status){
    case"CONFIRMED": return"text-[#3DAA7A] border border-[#3DAA7A] text-[10px] bg-[#D1FAE5] font-bold px-2 py-0.5 rounded tracking-wide";
    case"PENDING":   return"text-[#C9922A] border border-[#C9922A] text-[10px] bg-[#FEF3C7] font-bold px-2 py-0.5 rounded tracking-wide";
    case"CANCELLED": return"text-[#C94A3A] border border-[#C94A3A] text-[10px] bg-[#bfafaa] font-bold px-2 py-0.5 rounded tracking-wide";
    case"SEEN":      return"text-[#C9922A] border border-[#C9922A] text-[10px] bg-[#FEF3C7] font-bold px-2 py-0.5 rounded tracking-wide";
    case"ACTIVE":    return"text-[#3DAA7A] border border-[#3DAA7A] text-[10px]  bg-[#D1FAE5] font-bold px-2 py-0.5 rounded tracking-wide";
    case"NEW":       return"text-[#C94A3A] border border-[#C94A3A] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    default:         return"";
  }
}
function eventColor(color:string){
  switch(color){
    case"blue":  return"bg-blue-100 border-l-2 border-blue-400 text-blue-700";
    case"red":   return"bg-red-50 border-l-2 border-red-400 text-red-700";
    case"gold":  return"bg-yellow-50 border-l-2 border-yellow-500 text-yellow-700";
    case"green": return"bg-green-50 border-l-2 border-green-500 text-green-700";
    default:     return"bg-gray-100 border-l-2 border-gray-400 text-gray-700";
  }
}
function eventColorDay(color:string){
  switch(color){
    case"blue":  return{bar:"#3B82F6",text:"#1D4ED8"};
    case"red":   return{bar:"#EF4444",text:"#DC2626"};
    case"gold":  return{bar:"#D97706",text:"#92400E"};
    case"green": return{bar:"#10B981",text:"#065F46"};
    default:     return{bar:"#6B7280",text:"#374151"};
  }
}

// ── AddForm type ──────────────────────────────────────────────────────────────
type AddForm = { name:string; email:string; phone:string; specialty:string; date:string; time:string; notes:string };

// ── Pending Modal — TOP-LEVEL component ───────────────────────────────────────
interface PendingModalProps {
  isDark:boolean; card:string; cardBorder:string; text1:string; text2:string;
  pageBg:string; cardInner:string; inputBg:string; inputBorder:string;
  onClose:()=>void;
}
function PendingModal({ isDark,card,cardBorder,text1,text2,pageBg,cardInner,onClose }:PendingModalProps){
  return(
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative ml-auto w-full max-w-2xl h-full overflow-y-auto p-8" style={{backgroundColor:pageBg}}>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold" style={{color: isDark ? "#ffffff": "#711C31"}}>APPOINTMENTS /</h2>
          <span className="text-2xl font-bold" style={{color:isDark?"#B09070":"#7A6040"}}>Pending Confirmations</span>
        </div>
        <div className="inline-block text-xs px-3 py-1 rounded-full border mb-6"
          style={{borderColor:isDark?"#5C2A3A":"#D9C9A8",color:text2,backgroundColor:cardInner}}>
          {pendingConfirmations.length} Appointments need confirmation
        </div>
        <div className="flex flex-col gap-4">
          {pendingConfirmations.map((p,i)=>(
            <div key={i} className={`rounded-2xl p-5 border ${cardBorder}`} style={{backgroundColor:card}}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-base font-semibold" style={{color:isDark?"#711C31":"#7A3048]"}}>{p.name}</span>
                <span className="text-xs" style={{color:text2}}>{p.timeAgo}</span>
              </div>
              <p className="text-sm mb-1" style={{color:text2}}>{p.service} · {p.date}</p>
              <p className="text-xs mb-4 flex items-center gap-1" style={{color:text2}}><span>⏰</span>{p.time}</p>
              <div className="flex gap-3">
                <button className="px-6 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{backgroundColor:isDark?"#591727":"#591727"}}>Call</button>
                <button className={`px-6 py-2 rounded-xl text-sm font-semibold border`}
                  style={{borderColor:isDark?"#FFD52F":"#FFD52F",color:isDark?"#591727":"#3D0A1F"}}>Confirm</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Add Patient Modal — TOP-LEVEL component ───────────────────────────────────
interface AddPatientModalProps {
  isDark:boolean; card:string; cardBorder:string; text1:string; text2:string;
  pageBg:string; inputBg:string; inputBorder:string;
  addForm:AddForm; setAddForm:React.Dispatch<React.SetStateAction<AddForm>>;
  onClose:()=>void;
}
function AddPatientModal({isDark,card,cardBorder,text1,text2,pageBg,inputBg,inputBorder,addForm,setAddForm,onClose}:AddPatientModalProps){
  const fields = [
    {label:"👤 PATIENT NAME",  key:"name",    type:"text",  ph:"Enter Name"},
    {label:"✉️ EMAIL ADDRESS", key:"email",   type:"email", ph:"Enter Email"},
    {label:"📞 PHONE NUMBER",  key:"phone",   type:"tel",   ph:"Contact Number"},
  ];
  return(
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative w-full max-w-3xl h-full overflow-y-auto p-8" style={{backgroundColor:pageBg}}>
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold" style={{color:isDark ? "#ffffff": ""}}>APPOINTMENTS /</h2>
          <span className="text-2xl font-bold" style={{color:isDark?"#B09070":"#7A6040"}}>Add Patient</span>
        </div>
        <div className={`rounded-2xl p-8 border ${cardBorder}`} style={{backgroundColor:card}}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left */}
            <div className="flex flex-col gap-5">
              {fields.map(f=>(
                <div key={f.key}>
                  <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                    style={{color:isDark?"#591727":"#7A6040"}}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.ph}
                    value={(addForm as any)[f.key]}
                    onChange={e=>setAddForm(prev=>({...prev,[f.key]:e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                    style={{backgroundColor:inputBg,borderColor:inputBorder,color:text1}}
                  />
                </div>
              ))}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                  style={{color:isDark?"#591727":"#7A6040"}}>➕ SPECIALITIES</label>
                <select value={addForm.specialty}
                  onChange={e=>setAddForm(prev=>({...prev,specialty:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border appearance-none"
                  style={{backgroundColor:inputBg,borderColor:inputBorder,color:addForm.specialty?text1:text2}}>
                  <option value="">Select Speciality</option>
                  <option>Aligneurs</option><option>Parodontologie</option>
                  <option>Endodontie</option><option>Réhabilitation totale du sourire</option>
                  <option>Complex Surgery</option>
                </select>
              </div>
            </div>
            {/* Right */}
            <div className="flex flex-col gap-5">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                  style={{color:isDark?"#591727":"#7A6040"}}>📅 SELECT DATE</label>
                <input type="date" value={addForm.date}
                  onChange={e=>setAddForm(prev=>({...prev,date:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                  style={{backgroundColor:inputBg,borderColor:inputBorder,color:text1}}/>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                  style={{color:isDark?"#591727":"#7A6040"}}>⏰ SELECT TIME</label>
                <select value={addForm.time}
                  onChange={e=>setAddForm(prev=>({...prev,time:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border appearance-none"
                  style={{backgroundColor:isDark ? "c1a694": "",borderColor:inputBorder,color:addForm.time?text1:text2}}>
                  <option value="">Select Time</option>
                  {["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM",
                    "01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"].map(t=>(
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                  style={{color:isDark?"#591727":"#7A6040"}}>📋 NOTES</label>
                <textarea placeholder="Message" value={addForm.notes}
                  onChange={e=>setAddForm(prev=>({...prev,notes:e.target.value}))}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
                  style={{backgroundColor:inputBg,borderColor:inputBorder,color:text1}}/>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border"
              style={{borderColor:isDark?"#5C2A3A":"#3D0A1F",color:text1}}>
              Discard Changes
            </button>
            <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{backgroundColor:isDark?"#8B1A2E":"#3D0A1F"}}>
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AppointmentsPage(){
  const {theme}=useTheme();
  const isDark=theme==="dark";

  const [viewMode,   setViewMode]   = useState<ViewMode>("month");
  const [displayMode,setDisplayMode]= useState<DisplayMode>("calendar");
  const [modal,      setModal]      = useState<ModalType>("none");
  const [addForm,    setAddForm]    = useState<AddForm>({name:"",email:"",phone:"",specialty:"",date:"",time:"",notes:""});

  const currentMonth = "March 2026";
  const currentWeek  = "March 7-13, 2026";
  const currentDay   = "March 7, 2026";

  // Color tokens
   const card       = isDark ? "#c9a898" : "#EDE0C4";
  const cardBorder   = isDark?"border-[#5C2A3A]":"border-[#D9C9A8]";
  const cardInner  = isDark ? "#d0baa3" : "#E4D5B8";
 const text1      = isDark ? "#591727" : "#591727";
 const text2      = isDark ? "#591727" : "#591727";
 const pageBg     = isDark ? "#2A0D18" : "#ffe9bf";
  const inputBg      = isDark?"#c1a694":"#ffffff";
  const inputBorder  = isDark?"#5C2A3A":"#D9C9A8";
  const tableBg      = isDark?"#c1a694":"#FDFAF4";
  const tableRowHover= isDark?"#ffffff":"#EDE0C4";

  

  const dateTop    = viewMode==="week"?"WEEK":viewMode==="day"?"TODAY":"MONTH";
  const dateBottom = viewMode==="month"?currentMonth:viewMode==="week"?currentWeek:currentDay;

  // ── Calendar renderers (pure functions, not components) ───────────────────
  function renderMonthCalendar(){
    const cells:(number|null)[]=[...Array(MARCH_OFFSET).fill(null),...Array.from({length:MARCH_DAYS_COUNT},(_,i)=>i+1)];
    while(cells.length%7!==0)cells.push(null);
    const weeks:(number|null)[][]=[];
    for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
    return(
      <div>
        <div className="grid grid-cols-7 gap-px mb-1">
          {MONTH_DAYS.map(d=><div key={d} className="text-[11px] font-semibold text-center py-2" style={{color:text2}}>{d}</div>)}
        </div>
        <div className="flex flex-col gap-px">
          {weeks.map((week,wi)=>(
            <div key={wi} className="grid grid-cols-7 gap-px">
              {week.map((day,di)=>{
                const events=day?(monthEvents[String(day)]||[]):[];
                const isToday=day===4;
                return(
                  <div key={di} className={`min-h-[80px] p-1.5 rounded-lg border transition-colors ${cardBorder}`}
                    style={{backgroundColor:day?cardInner:"transparent"}}>
                    {day&&(
                      <>
                        <div className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-1`}
                          style={{backgroundColor:isToday?(isDark?"#8B1A2E":"#3D0A1F"):"transparent",color:isToday?"#F5ECD7":text1}}>
                          {day}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {events.map((ev,ei)=>(
                            <div key={ei} className={`text-[12px] px-1 py-0.5 rounded truncate ${eventColor(ev.color)}`}>{ev.label}</div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderWeekCalendar(){
    return(
      <div>
        <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px mb-1">
          <div/>
          {WEEK_DAYS.map(d=>(
            <div key={d.date} className="text-center py-2">
              <div className="text-[11px]" style={{color:text2}}>{d.label}</div>
              <div className="text-base font-bold" style={{color:text1}}>{d.date}</div>
            </div>
          ))}
        </div>
        <div>
          {WEEK_TIMES.map(t=>(
            <div key={t} className="grid grid-cols-[60px_repeat(7,1fr)] gap-px min-h-[70px]">
              <div className="text-[11px] pt-1 pr-2 text-right" style={{color:text2}}>{t}</div>
              {WEEK_DAYS.map((_,di)=>{
                const evs=weekEvents.filter(e=>e.day===di&&e.time===t);
                return(
                  <div key={di} className={`border-t ${cardBorder} p-1 flex flex-col gap-0.5`}>
                    {evs.map((ev,ei)=>(
                      <div key={ei} className={`text-[12px] px-1 py-0.5 rounded truncate ${eventColor(ev.color)}`}>{ev.label}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderDayCalendar(){
    return(
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="text-center mb-4">
            <div className="inline-flex flex-col items-center justify-center w-14 h-14 rounded-full"
              style={{backgroundColor:isDark?"#8B1A2E":"#3D0A1F"}}>
              <span className="text-2xl font-bold text-white">07</span>
            </div>
            <div className="text-lg font-bold mt-1" style={{color:text1}}>Monday</div>
            <div className="text-xs" style={{color:text2}}>MARCH 2026</div>
          </div>
          <div className="relative">
            {DAY_TIMES_FULL.map(t=>{
              const evs=dayEvents.filter(e=>e.time===t);
              return(
                <div key={t} className="flex gap-3 min-h-[60px]">
                  <div className="w-16 text-right text-[11px] pt-1 shrink-0" style={{color:text2}}>
                    <div>{t.split(" ")[0]}</div><div>{t.split(" ")[1]}</div>
                  </div>
                  <div className={`flex-1 border-t ${cardBorder} pt-1 flex flex-col gap-1`}>
                    {evs.map((ev,i)=>{
                      const c=eventColorDay(ev.color);
                      return(
                        <div key={i} className="rounded-lg px-3 py-2"
                          style={{borderLeft:`3px solid ${c.bar}`,backgroundColor:isDark?"#4A2030":"#FDFAF4"}}>
                          <div className="text-[12px] font-semibold uppercase tracking-wide" style={{color:c.bar}}>{ev.label}</div>
                          <div className="text-sm font-semibold" style={{color:text1}}>{ev.name}</div>
                          <div className="text-[10px]" style={{color:text2}}>⏰ {t}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-56 shrink-0">
          <div className={`rounded-2xl p-4 border ${cardBorder}`} style={{backgroundColor:cardInner}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold tracking-widest uppercase" style={{color:text2}}>NEXT UP</span>
              <span className="text-base">🔔</span>
            </div>
            <div className={`rounded-xl p-3 border ${cardBorder}`} style={{backgroundColor:card}}>
              <div className="text-[10px] font-bold" style={{color:text2}}>{nextUp.date}</div>
              <div className="text-sm font-bold my-0.5" style={{color:text1}}>{nextUp.name}</div>
              <div className="text-[11px] mb-2" style={{color:text2}}>{nextUp.detail}</div>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{backgroundColor:isDark?"#8B1A2E":"#3D0A1F"}}>Call</button>
                <button className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border`}
                  style={{borderColor:isDark?"#5C2A3A":"#3D0A1F",color:text1}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return(
    <div className="min-h-full ml-10 transition-colors duration-300" style={{marginTop:"40px"}}>

      {/* Modals — mounted at top level, OUTSIDE the page render tree */}
      {modal==="pending" && (
        <PendingModal
          isDark={isDark} card={card} cardBorder={cardBorder} cardInner={cardInner}
          text1={text1} text2={text2} pageBg={pageBg} inputBg={inputBg} inputBorder={inputBorder}
          onClose={()=>setModal("none")}
        />
      )}
      {modal==="addPatient" && (
        <AddPatientModal
          isDark={isDark} card={card} cardBorder={cardBorder}
          text1={text1} text2={text2} pageBg={pageBg} inputBg={inputBg} inputBorder={inputBorder}
          addForm={addForm} setAddForm={setAddForm}
          onClose={()=>{setModal("none");setAddForm({name:"",email:"",phone:"",specialty:"",date:"",time:"",notes:""}); }}
        />
      )}

      {/* Header Buttons */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold tracking-wide" style={{ color: isDark ? "#ffffff":"#591727"}}>APPOINTMENTS</h1>
        <div className="flex gap-3">
          <button onClick={()=>setModal("pending")}
            className={`relative px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${isDark?"border-[#FFD52F] text-white hover:bg-[#D4A574] hover:text-[#3D0A1F]":"border-[#711C31] text-[#711C31] hover:bg-[#711C31] hover:text-[#F5ECD7]"}`}>
            Pending Confirmations
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[12px] font-bold flex items-center justify-center text-white bg-[#8B1A2E]">
              {pendingConfirmations.length}
            </span>
          </button>
          <button onClick={()=>setModal("addPatient")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${isDark?"border-[#FFD52F] text-white hover:bg-[#D4A574] hover:text-[#3D0A1F]":"border-[#711C31] bg-[#591727] text-white hover:bg-[#711C31]"}`}>
            + Add Patient
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {statCards.map(c=>(
          <div key={c.label} className={`relative rounded-2xl p-6 border ${cardBorder} transition-colors duration-300`}
            style={{backgroundColor:isDark?"#d0baa3":"#ffe9bf"}}>
            <p className=" mb-3" style={{color:text2,}}>{c.label}</p>
            <div className="flex items-end justify-between gap-2">.
              {/* CAPSULE EDGE DECOR */}
<div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
  <div
    className="h-full w-full"
    style={{
      backgroundColor: isDark ? "#5C2A3A" : "#ffe9bf",
      borderTopLeftRadius: "9999px",
      borderBottomLeftRadius: "9999px",
      borderTopRightRadius: "0px",
      borderBottomRightRadius: "0px",

      // gives smooth “embedded” look like your reference image
      boxShadow: isDark
        ? "inset 2px 0 10px rgba(0,0,0,0.25)"
        : "inset 4px 0 8px rgba(0,0,0,0.15)",
    }}
  />
</div>
              <span className="text-3xl font-bold" style={{color:text1}}>{c.value}</span>
              {c.badge&&<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6B3A4A] text-[#F5ECD7] whitespace-nowrap">{c.badge}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cardBorder}`} style={{backgroundColor:card}}>
          <span className="text-base">📅</span>
          <div>
            <div className="text-[12px] font-bold tracking-widest uppercase" style={{color:text2}}>{dateTop}</div>
            <div className="text-sm font-semibold" style={{color:text1}}>{dateBottom}</div>
          </div>
          <div className="flex gap-1 ml-2">
            <button className="w-6 h-6 flex items-center justify-center rounded text-xs" style={{color:text2}}>‹</button>
            <button className="w-6 h-6 flex items-center justify-center rounded text-xs" style={{color:text2}}>›</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={()=>setDisplayMode("calendar")}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${cardBorder}`}
              style={{backgroundColor:displayMode==="calendar"?(isDark?"#8B1A2E":"#3D0A1F"):card,color:displayMode==="calendar"?"#F5ECD7":text2}}>
              📅
            </button>
            <button onClick={()=>setDisplayMode("list")}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors ${cardBorder}`}
              style={{backgroundColor:displayMode==="list"?(isDark?"#8B1A2E":"#3D0A1F"):card,color:displayMode==="list"?"#F5ECD7":text2}}>
              📋
            </button>
          </div>
          <div className={`flex rounded-xl overflow-hidden border ${cardBorder}`} style={{backgroundColor:card}}>
            {(["month","week","day"] as ViewMode[]).map(v=>(
              <button key={v} onClick={()=>setViewMode(v)}
                className="px-5 py-2 text-sm font-semibold capitalize transition-colors"
                style={{backgroundColor:viewMode===v?(isDark?"#8B1A2E":"#3D0A1F"):"transparent",color:viewMode===v?"#F5ECD7":text2}}>
                {v.charAt(0).toUpperCase()+v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {displayMode==="calendar"?(
        <>
          <div className={`rounded-2xl p-5 border ${cardBorder} mb-4 transition-colors duration-300`} style={{backgroundColor:card}}>
            {viewMode==="month"&&renderMonthCalendar()}
            {viewMode==="week"&&renderWeekCalendar()}
            {viewMode==="day"&&renderDayCalendar()}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Upcoming */}
            <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{backgroundColor:card}}>
              <h3 className="text-base font-semibold mb-3" style={{color:text1}}>
                Upcoming Appointments ({viewMode==="month"?"This Month":viewMode==="week"?"This week":"Today"})
              </h3>
              <div className="flex flex-col gap-2">
                {upcomingAppointments.map((a,i)=>(
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${cardBorder}`} style={{backgroundColor:cardInner}}>
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[36px]">
                        <div className="text-sm font-bold" style={{color:text1}}>{a.time}</div>
                        <div className="text-[10px]" style={{color:text2}}>{a.period}</div>
                      </div>
                      <div className="w-px h-8" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
                      <div>
                        <div className="text-sm font-semibold" style={{color:text1}}>{a.name}</div>
                        <div className="text-[11px]" style={{color:text2}}>{a.type}</div>
                      </div>
                    </div>
                    <span className={statusStyle(a.status)}>{a.status}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 mt-3">
                <div className="w-5 h-1.5 rounded-full" style={{backgroundColor:isDark?"#D4A574":"#3D0A1F"}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
              </div>
            </div>
            {/* Patients seen */}
            <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{backgroundColor:card}}>
              <h3 className="text-base font-semibold mb-3" style={{color:text1}}>
                Patients seen ({viewMode==="month"?"This Month":viewMode==="week"?"This week":"Today"})
              </h3>
              <div className="flex flex-col gap-2">
                {patientsSeen.map((a,i)=>(
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${cardBorder}`} style={{backgroundColor:cardInner}}>
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[36px]">
                        <div className="text-sm font-bold" style={{color:text1}}>{a.time}</div>
                        <div className="text-[10px]" style={{color:text2}}>{a.period}</div>
                      </div>
                      <div className="w-px h-8" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
                      <div>
                        <div className="text-sm font-semibold" style={{color:text1}}>{a.name}</div>
                        <div className="text-[11px]" style={{color:text2}}>{a.type}</div>
                      </div>
                    </div>
                    <span className={statusStyle(a.status)}>{a.status}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-1.5 mt-3">
                <div className="w-5 h-1.5 rounded-full" style={{backgroundColor:isDark?"#D4A574":"#3D0A1F"}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
                <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
              </div>
            </div>
          </div>
        </>
      ):(
        /* List View */
        <div className={`rounded-2xl border ${cardBorder} overflow-hidden`} style={{backgroundColor:tableBg}}>
          <div className="flex items-center gap-3 p-4 border-b" style={{borderColor:isDark?"#5C2A3A":"#D9C9A8"}}>
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border"
              style={{backgroundColor:inputBg,borderColor:inputBorder}}>
              <span style={{color:text2}}>🔍</span>
              <input type="text" placeholder="Search by name, ID or phone..."
                className="flex-1 text-sm bg-transparent outline-none" style={{color:text1}}/>
            </div>
            <select className="px-3 py-2 rounded-xl border text-sm outline-none"
              style={{backgroundColor:inputBg,borderColor:inputBorder,color:text2}}>
              <option>All Statuses</option><option>Active</option><option>Pending</option><option>Cancelled</option>
            </select>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
              style={{backgroundColor:inputBg,borderColor:inputBorder,color:text2}}>
              📅 Last Visit
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{borderBottom:`1px solid ${isDark?"#5C2A3A":"#D9C9A8"}`}}>
                {["Patient Name","Email & Phone","Spécialités","Last Visit","Next Appointment","Status","Actions"].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold" style={{color:text2}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allAppointments.map((row,i)=>(
                <tr key={i} className="transition-colors cursor-pointer"
                  style={{borderBottom:`1px solid ${isDark?"#5C2A3A":"#D9C9A8"}`}}
                  onMouseEnter={e=>(e.currentTarget.style.backgroundColor=tableRowHover)}
                  onMouseLeave={e=>(e.currentTarget.style.backgroundColor="transparent")}>
                  <td className="px-4 py-3">
                    <div className="font-semibold" style={{color:text1}}>{row.name}</div>
                    <div className="text-[11px]" style={{color:text2}}>ID: {row.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[11px]" style={{color:text2}}>{row.email}</div>
                    <div className="text-[11px]" style={{color:text2}}>{row.phone}</div>
                  </td>
                  <td className="px-4 py-3"><span className="text-[11px]" style={{color:text2}}>{row.specialty}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px]" style={{color:text2}}>{row.lastVisit}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">📅</span>
                      <span className="text-[11px]" style={{color:isDark?"#711C31":"#7A3048"}}>{row.nextAppt}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={statusStyle(row.status)}>{row.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-base" title="Delete" style={{color:text2}}>🗑️</button>
                      <button className="text-base" title="View"   style={{color:text2}}>👁️</button>
                      <button className="text-base" title="Add"    style={{color:text2}}>➕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3" style={{borderTop:`1px solid ${isDark?"#5C2A3A":"#D9C9A8"}`}}>
            <span className="text-xs" style={{color:text2}}>Showing 1 to 12 of 2,842 results</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{color:text2}}>‹</button>
              {[1,2,3].map(n=>(
                <button key={n} className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                  style={{backgroundColor:n===1?(isDark?"#8B1A2E":"#3D0A1F"):"transparent",color:n===1?"#F5ECD7":text2}}>
                  {n}
                </button>
              ))}
              <span className="text-xs px-1" style={{color:text2}}>...</span>
              <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{color:text2}}>71</button>
              <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{color:text2}}>›</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
