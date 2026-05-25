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
  "1":[{label:"09:00 AM · Mike ...",    color:"gray"}],
  "2":[{label:"10:30 AM · Sarah J...",  color:"gray"},{label:"02:00 PM · David ...",color:"gray"}],
  "3":[{label:"Surgery: Emma W...",     color:"red"}],
  "4":[{label:"11:45 AM · Lunch ...",   color:"red"},{label:"04:00 PM · Rober...",color:"red"}],
  "8":[{label:"08:00 AM · Chec...",     color:"gray"}],
  "10":[{label:"10:00 AM · Sarah ...",  color:"#591727"},{label:"11:00 AM · Paul A...",color:"#591727"}],
  "17":[{label:"10:00 AM · Sarah ...",  color:"#gray"}],
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
    case"PENDING":   return"text-[#753141] border border-[#D3D3D3] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide";
    case"CANCELLED": return"text-[#C94A3A] border border-[#C94A3A] text-[10px] bg-[#bfafaa] font-bold px-2 py-0.5 rounded tracking-wide";
    case"SEEN":      return"text-[#ffffff] border border-[#591727] text-[10px] bg-[#591727] font-bold px-2 py-0.5 rounded tracking-wide";
    case"ACTIVE":    return"text-[#3DAA7A] border border-[#3DAA7A] text-[10px] bg-[#D1FAE5] font-bold px-2 py-0.5 rounded tracking-wide";
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

// ── Pending Modal ─────────────────────────────────────────────────────────────
interface PendingModalProps {
  isDark:boolean; card:string; cardBorder:string; text1:string; text2:string;
  pageBg:string; cardInner:string; inputBg:string; inputBorder:string;
  onClose:()=>void;
}
function PendingModal({ isDark,card,cardBorder,text1,text2,pageBg,cardInner,onClose }:PendingModalProps){
  return(
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative ml-auto w-full max-w-2xl h-full overflow-y-auto p-4 sm:p-8" style={{backgroundColor:pageBg}}>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border transition hover:scale-105 shrink-0"
            style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", backgroundColor: isDark ? "#4A2030" : "#FDFAF4", color: isDark ? "#F5ECD7" : "#3D0A1F" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-lg sm:text-2xl font-bold" style={{ color: isDark ? "#ffffff" : "#711C31" }}>APPOINTMENTS /</h2>
          <span className="text-lg sm:text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#7A6040" }}>Pending Confirmations</span>
        </div>
        <div className="inline-block text-xs px-3 py-1 rounded-full border mb-6"
          style={{borderColor:isDark?"#5C2A3A":"#D9C9A8",color:text2,backgroundColor:cardInner}}>
          {pendingConfirmations.length} Appointments need confirmation
        </div>
        <div className="flex flex-col gap-4">
          {pendingConfirmations.map((p,i)=>(
            <div key={i} className={`rounded-2xl p-4 sm:p-5 border ${cardBorder}`} style={{backgroundColor:card}}>
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-base font-semibold truncate" style={{color:isDark?"#711C31":"#7A3048"}}>{p.name}</span>
                <span className="text-xs shrink-0" style={{color:text2}}>{p.timeAgo}</span>
              </div>
              <p className="text-sm mb-1" style={{color:text2}}>{p.service} · {p.date}</p>
              <p className="text-xs mb-4 flex items-center gap-1" style={{color:text2}}><span>⏰</span>{p.time}</p>
              <div className="flex gap-3">
                <button className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{backgroundColor:"#591727"}}>Call</button>
                <button className={`px-5 py-2 rounded-xl text-sm font-semibold border`}
                  style={{borderColor:"#591727",color:isDark?"#591727":"#3D0A1F"}}>Confirm</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Add Patient Modal ─────────────────────────────────────────────────────────
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
      <div className="relative w-full max-w-3xl h-full overflow-y-auto p-4 sm:p-8" style={{backgroundColor:pageBg}}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold" style={{color:isDark ? "#ffffff": ""}}>APPOINTMENTS /</h2>
          <span className="text-xl sm:text-2xl font-bold" style={{color:isDark?"#B09070":"#7A6040"}}>Add Patient</span>
        </div>
        <div className={`rounded-2xl p-4 sm:p-8 border ${cardBorder}`} style={{backgroundColor:card}}>
          {/* Mobile: 1 col; sm+: 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  style={{color:isDark?"#591727":"#7A6040"}}>
                  <span style={{color:"#591727"}}>📅</span> SELECT DATE
                </label>
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
                  style={{backgroundColor:inputBg,borderColor:inputBorder,color:addForm.time?text1:text2}}>
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
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold border"
              style={{borderColor:isDark?"#5C2A3A":"#3D0A1F",color:text1}}>
              Discard Changes
            </button>
            <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
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
  const card        = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder  = isDark?"border-[#753141]":"border-[#753141]";
  const cardInner   = isDark ? "#d0baa3" : "#FFFFFF";
  const text1       = isDark ? "#591727" : "#591727";
  const text2       = isDark ? "#591727" : "#591727";
  const pageBg      = isDark ? "#2A0D18" : "#FFFFFF";
  const inputBg     = isDark?"#c1a694":"#ffffff";
  const inputBorder = isDark?"#5C2A3A":"#D9C9A8";
  const tableBg     = isDark?"#c1a694":"#FDFAF4";
  const tableRowHover= isDark?"#ffffff":"#EDE0C4";

  const dateTop    = viewMode==="week"?"WEEK":viewMode==="day"?"TODAY":"MONTH";
  const dateBottom = viewMode==="month"?currentMonth:viewMode==="week"?currentWeek:currentDay;

  // ── Calendar renderers ────────────────────────────────────────────────────
  function renderMonthCalendar(){
    const cells:(number|null)[]=[...Array(MARCH_OFFSET).fill(null),...Array.from({length:MARCH_DAYS_COUNT},(_,i)=>i+1)];
    while(cells.length%7!==0)cells.push(null);
    const weeks:(number|null)[][]=[];
    for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
    return(
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
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
                    <div key={di} className={`min-h-[70px] sm:min-h-[80px] p-1 sm:p-1.5 rounded-lg border transition-colors ${cardBorder}`}
                      style={{backgroundColor:day?cardInner:"transparent"}}>
                      {day&&(
                        <>
                          <div className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-1 numeric-font`}
                            style={{backgroundColor:isToday?(isDark?"#8B1A2E":"#3D0A1F"):"transparent",color:isToday?"#F5ECD7":text1}}>
                            {day}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {events.map((ev,ei)=>(
                              <div key={ei} className={`text-[10px] sm:text-[12px] px-1 py-0.5 rounded truncate ${eventColor(ev.color)}`}>{ev.label}</div>
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
      </div>
    );
  }

  function renderWeekCalendar(){
    return(
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-[50px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)] gap-px mb-1">
            <div/>
            {WEEK_DAYS.map(d=>(
              <div key={d.date} className="text-center py-2 numeric-font">
                <div className="text-[11px]" style={{color:text2}}>{d.label}</div>
                <div className="text-base font-bold" style={{color:text1}}>{d.date}</div>
              </div>
            ))}
          </div>
          <div>
            {WEEK_TIMES.map(t=>(
              <div key={t} className="grid grid-cols-[50px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)] gap-px min-h-[70px] numeric-font">
                <div className="text-[11px] pt-1 pr-2 text-right" style={{color:text2}}>{t}</div>
                {WEEK_DAYS.map((_,di)=>{
                  const evs=weekEvents.filter(e=>e.day===di&&e.time===t);
                  return(
                    <div key={di} className={`border-t ${cardBorder} p-1 flex flex-col gap-0.5`}>
                      {evs.map((ev,ei)=>(
                        <div key={ei} className={`text-[10px] sm:text-[12px] px-1 py-0.5 rounded truncate ${eventColor(ev.color)}`}>{ev.label}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderDayCalendar(){
    return(
      /* On mobile stack vertically; on sm+ side-by-side */
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="text-center mb-4">
            <div className="inline-flex flex-col items-center justify-center w-14 h-14 rounded-full"
              style={{backgroundColor:isDark?"#8B1A2E":"#3D0A1F"}}>
              <span className="text-2xl font-bold text-white numeric-font">07</span>
            </div>
            <div className="text-lg font-bold mt-1" style={{color:text1}}>Monday</div>
            <div className="text-xs" style={{color:text2}}>MARCH 2026</div>
          </div>
          <div className="relative">
            {DAY_TIMES_FULL.map(t=>{
              const evs=dayEvents.filter(e=>e.time===t);
              return(
                <div key={t} className="flex gap-3 min-h-[60px]">
                  <div className="w-14 sm:w-16 text-right text-[11px] pt-1 shrink-0" style={{color:text2}}>
                    <div className="numeric-font">{t.split(" ")[0]}</div><div className="numeric-font">{t.split(" ")[1]}</div>
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
        {/* Next Up panel — full width on mobile, fixed sidebar on sm+ */}
        <div className="w-full sm:w-56 shrink-0">
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
    <div className="min-h-full transition-colors duration-300 overflow-x-hidden sm:pl-10" style={{marginTop:"40px"}}>

      {/* Modals */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide" style={{ color: isDark ? "#ffffff":"#591727"}}>APPOINTMENTS</h1>
        <div className="flex flex-col mt-2 sm:flex-row gap-4 pr-2 sm:gap-8 w-full sm:w-auto">
          <button onClick={()=>setModal("pending")}
            className={`relative w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${isDark?"border-[#FFFFFF] text-white hover:bg-[#c9a898] hover:text-[#3D0A1F]":"border-[#711C31] text-[#711C31] hover:bg-[#711C31] hover:text-[#F5ECD7]"}`}>
            Pending Confirmations
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center text-white bg-[#8B1A2E] border-2 border-white sm:border-none">
              {pendingConfirmations.length}
            </span>
          </button>
          <button onClick={()=>setModal("addPatient")}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${isDark?"border-[#FFFFFF] text-white hover:bg-[#c9a898] hover:text-[#3D0A1F]":"border-[#711C31] bg-[#591727] text-white hover:bg-[#711C31]"}`}>
            + Add Patient
          </button>
        </div>
      </div>

      {/* Stat Cards — 1 col on mobile, 2 on medium, 4 on sm+ */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(c=>(
          <div key={c.label} className={`relative rounded-2xl p-5 border ${cardBorder} transition-colors duration-300`}
            style={{backgroundColor:isDark?"#c9a898":"#D3D3D3"}}>
            <p className="mb-3 text-sm" style={{color:text2}}>{c.label}</p>
            <div className="flex items-end justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-bold numeric-font" style={{color:text1, fontFamily: "var(--font-cinzel)"}}>{c.value}</span>
              {c.badge&&<span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#711C314D] text-[#591727] whitespace-nowrap">{c.badge}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        {/* Date indicator */}
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cardBorder} w-full sm:w-auto`} style={{backgroundColor:card}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#711C31" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold tracking-widest uppercase" style={{color:text2}}>{dateTop}</div>
            <div className="text-xs sm:text-sm font-semibold truncate" style={{color:text1}}>{dateBottom}</div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:bg-black/5" style={{color:text2}}>‹</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:bg-black/5" style={{color:text2}}>›</button>
          </div>
        </div>

        {/* View controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Display mode icons */}
          <div className={`flex p-1 rounded-xl border ${cardBorder}`} style={{backgroundColor:card}}>
            <button
              onClick={() => setDisplayMode("calendar")}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${displayMode==="calendar"?(isDark?"bg-[#8B1A2E] text-[#F5ECD7]":"bg-[#3D0A1F] text-[#F5ECD7]"):""}`}
              style={{ color: displayMode==="calendar"?"#F5ECD7":text2 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
            <button
              onClick={() => setDisplayMode("list")}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${displayMode==="list"?(isDark?"bg-[#8B1A2E] text-[#F5ECD7]":"bg-[#3D0A1F] text-[#F5ECD7]"):""}`}
              style={{ color: displayMode==="list"?"#F5ECD7":text2 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="8" y1="9" x2="12" y2="9" />
              </svg>
            </button>
          </div>
          {/* Month/Week/Day toggle */}
          <div className={`flex p-1 rounded-xl border ${cardBorder}`} style={{backgroundColor:card}}>
            {(["month","week","day"] as ViewMode[]).map(v=>(
              <button key={v} onClick={()=>setViewMode(v)}
                className={`px-4 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all ${viewMode===v?(isDark?"bg-[#8B1A2E] text-[#F5ECD7]":"bg-[#3D0A1F] text-[#F5ECD7]"):""}`}
                style={{color:viewMode===v?"#F5ECD7":text2}}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {displayMode==="calendar"?(
        <>
          <div className={`rounded-2xl p-4 sm:p-6 border ${cardBorder} mb-6 transition-colors duration-300 overflow-x-hidden min-w-0`} style={{backgroundColor:card}}>
            {viewMode==="month"&&renderMonthCalendar()}
            {viewMode==="week"&&renderWeekCalendar()}
            {viewMode==="day"&&renderDayCalendar()}
          </div>
          {/* Bottom cards — stacked on mobile, 2-cols on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upcoming */}
            <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder}`} style={{backgroundColor:card}}>
              <h3 className="text-base font-semibold mb-3" style={{color:text1}}>
                Upcoming Appointments ({viewMode==="month"?"This Month":viewMode==="week"?"This week":"Today"})
              </h3>
              <div className="flex flex-col gap-2">
                {upcomingAppointments.map((a,i)=>(
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border gap-2 ${cardBorder}`} style={{backgroundColor:cardInner}}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-center min-w-[36px] shrink-0">
                        <div className="text-sm font-bold numeric-font" style={{color:text1}}>{a.time}</div>
                        <div className="text-[10px]" style={{color:text2}}>{a.period}</div>
                      </div>
                      <div className="w-px h-8 shrink-0" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{color:text1}}>{a.name}</div>
                        <div className="text-[11px] truncate" style={{color:text2}}>{a.type}</div>
                      </div>
                    </div>
                    <span className={`${statusStyle(a.status)} shrink-0`}>{a.status}</span>
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
            <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder}`} style={{backgroundColor:card}}>
              <h3 className="text-base font-semibold mb-3" style={{color:text1}}>
                Patients seen ({viewMode==="month"?"This Month":viewMode==="week"?"This week":"Today"})
              </h3>
              <div className="flex flex-col gap-2">
                {patientsSeen.map((a,i)=>(
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border gap-2 ${cardBorder}`} style={{backgroundColor:cardInner}}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-center min-w-[36px] shrink-0">
                        <div className="text-sm font-bold" style={{color:text1}}>{a.time}</div>
                        <div className="text-[10px]" style={{color:text2}}>{a.period}</div>
                      </div>
                      <div className="w-px h-8 shrink-0" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{color:text1}}>{a.name}</div>
                        <div className="text-[11px] truncate" style={{color:text2}}>{a.type}</div>
                      </div>
                    </div>
                    <span className={`${statusStyle(a.status)} shrink-0`}>{a.status}</span>
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
        /* List View — table scrolls horizontally on mobile */
        <div className={`rounded-2xl border ${cardBorder} overflow-hidden`} style={{backgroundColor:tableBg}}>
          {/* Search/filter bar — stacks on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-4 border-b" style={{borderColor:isDark?"#5C2A3A":"#D9C9A8"}}>
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border"
              style={{backgroundColor:inputBg,borderColor:inputBorder}}>
              <span style={{color:text2}}>🔍</span>
              <input type="text" placeholder="Search by name, ID or phone..."
                className="flex-1 text-sm bg-transparent outline-none" style={{color:text1}}/>
            </div>
            <div className="flex gap-2">
              <select className="flex-1 sm:flex-none px-3 py-2 rounded-xl border text-sm outline-none"
                style={{backgroundColor:inputBg,borderColor:inputBorder,color:text2}}>
                <option>All Statuses</option><option>Active</option><option>Pending</option><option>Cancelled</option>
              </select>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
                style={{backgroundColor:inputBg,borderColor:inputBorder,color:text2}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="hidden sm:inline">Last Visit</span>
              </button>
            </div>
          </div>

          {/* Table — horizontal scroll on mobile */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{borderBottom:`1px solid ${isDark?"#5C2A3A":"#D9C9A8"}`}}>
                  {["Patient Name","Email & Phone","Spécialités","Last Visit","Next Appointment","Status","Actions"].map(h=>(
                    <th key={h} className="text-left px-3 sm:px-4 py-3 text-[13px] sm:text-[14px] font-semibold whitespace-nowrap" style={{color:text2}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allAppointments.map((row,i)=>(
                  <tr key={i} className="transition-colors cursor-pointer"
                    style={{borderBottom:`1px solid ${isDark?"#5C2A3A":"#D9C9A8"}`}}
                    onMouseEnter={e=>(e.currentTarget.style.backgroundColor=tableRowHover)}
                    onMouseLeave={e=>(e.currentTarget.style.backgroundColor="transparent")}>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="font-semibold whitespace-nowrap" style={{color:text1}}>{row.name}</div>
                      <div className="text-[13px] numeric-font" style={{color:text2}}>ID: {row.id}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="text-[13px] whitespace-nowrap" style={{color:text2}}>{row.email}</div>
                      <div className="text-[13px]" style={{color:text2}}>{row.phone}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3"><span className="text-[13px] whitespace-nowrap" style={{color:text2}}>{row.specialty}</span></td>
                    <td className="px-3 sm:px-4 py-3"><span className="text-[13px] whitespace-nowrap" style={{color:text2}}>{row.lastVisit}</span></td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#711C31" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-[13px]" style={{color:isDark?"#711C31":"#7A3048"}}>{row.nextAppt}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3"><span className={statusStyle(row.status)}>{row.status}</span></td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button title="Delete" className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-red-100 hover:scale-105" style={{color:text2}}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                        <button title="View" className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-blue-100 hover:scale-105" style={{color:text2}}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button title="Add" className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-green-100 hover:scale-105" style={{color:text2}}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3" style={{borderTop:`1px solid ${isDark?"#5C2A3A":"#D9C9A8"}`}}>
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

