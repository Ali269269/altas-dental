"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Data ─────────────────────────────────────────────────────────────────────

const statCards = [
  { label: "Total Bookings Today",    value: "18", badge: "-12%",         badgeType: "negative" },
  { label: "Pending Confirmations",   value: "5",  badge: "Action Needed", badgeType: "warning"  },
  { label: "New Patients",            value: "5",  badge: "-2 today",     badgeType: "neutral"  },
];

const DAYS  = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const TIMES = ["08:00","10:00","12:00","14:00","16:00","18:00"];
const occupancyData: number[][] = [
  [0,2,2,2,2,1,0],
  [2,4,3,3,2,0,0],
  [3,4,3,3,2,0,0],
  [2,2,3,3,1,0,0],
  [1,1,1,1,0,1,0],
  [1,1,1,1,0,1,0],
];

const services = [
  { name: "Aligneurs",                        pct: 42 },
  { name: "Parodontologie",                   pct: 35 },
  { name: "Endodontie",                       pct: 12 },
  { name: "Réhabilitation totale du sourire", pct:  8 },
];

const ALL_APPOINTMENTS = [
  { time:"09:30", period:"AM", name:"Sarah Jenkins",    type:"Routine Checkup",        status:"CONFIRMED", dayOffset: 0 },
  { time:"10:45", period:"AM", name:"Robert T. Chen",   type:"Wisdom Tooth Extraction", status:"PENDING",   dayOffset: 0 },
  { time:"02:45", period:"PM", name:"Elena Rodriguez",  type:"Teeth Whitening",         status:"CONFIRMED", dayOffset: 0 },
  { time:"04:00", period:"PM", name:"Marcous Aurelius", type:"Emergency Consultation",  status:"NEW",       dayOffset: 0 },
  { time:"09:00", period:"AM", name:"Marie Dupont",     type:"Implant Checkup",         status:"CONFIRMED", dayOffset: 1 },
  { time:"11:00", period:"AM", name:"Jean Pierre",      type:"Orthodontic Review",      status:"PENDING",   dayOffset: 1 },
];

const staff = [
  { name:"Dr. Aris Thorne",  role:"Principal Dentist", seen:142, avg:"45 min", avatar:"AT" },
  { name:"Dr. Julian Vane",  role:"Associate Dentist", seen:118, avg:"52 min", avatar:"JV" },
  { name:"Sarah Jenkins",    role:"Lead Hygienist",    seen:204, avg:"30 min", avatar:"SJ" },
];

const pendingConfirmations = [
  { name:"Lucy Van Pelt",      service:"Aligneurs",  date:"Oct 28", timeAgo:"2h ago" },
  { name:"Franklin Armstrong", service:"Endodontie", date:"Oct 30", timeAgo:"4h ago" },
  { name:"Franklin Armstrong", service:"Endodontie", date:"Oct 30", timeAgo:"4h ago" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusStyles(status: string) {
  switch (status) {
    case "CONFIRMED": return "text-[#3DAA7A] border border-[#3DAA7A] bg-[#D1FAE5] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "PENDING":   return "text-[#C9922A] border border-[#C9922A] bg-[#FEF3C7] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "NEW":       return "text-[#C94A3A] border border-[#C94A3A] bg-[#bfafaa] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    default:          return "";
  }
}

function OccupancyCell({ level, isDark }: { level: number; isDark: boolean }) {
  if (level === 0) return <div className="h-5 rounded-sm" style={{ backgroundColor: isDark ? "#3D1525" : "#E8D8C0" }} />;
  const darkColors  = ["","#7A5560","#9B6B7A","#8B3A52","#6B1A30"];
  const lightColors = ["","#D4BBA8","#C4A090","#A87878","#711C31"];
  return <div className="h-5 rounded-sm" style={{ backgroundColor: isDark ? darkColors[level] : lightColors[level] }} />;
}

function BadgePill({ badge, type, isDark }: { badge: string; type: string; isDark: boolean }) {
  const styles: Record<string,string> = {
    negative: isDark ? "bg-[#711C314D] text-[#591727]":"bg-[#711C314D] text-[#591727]",
    warning:  isDark ? "bg-[#711C314D] text-[#591727]" : "bg-[#711C314D] text-[#591727]",
    neutral:  isDark ? "bg-[#711C314D] text-[#591727]" : "bg-[#711C314D] text-[#591727]",
   
  };
  return <span className={`text-[10px]  px-5 py-2 rounded-full whitespace-nowrap ${styles[type]}`}>{badge}</span>;
}

// ── Today's Schedule Modal ────────────────────────────────────────────────────

interface ScheduleModalProps {
  isDark: boolean;
  card: string;
  cardBorder: string;
  cardInner: string;
  text1: string;
  text2: string;
  onClose: () => void;
}

function TodayScheduleModal({ isDark, card, cardBorder, cardInner, text1, text2, onClose }: ScheduleModalProps) {
  const today = new Date();
  const days  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months= ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const todayLabel = `${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

  const todayAppts = ALL_APPOINTMENTS.filter(a => a.dayOffset === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative rounded-2xl p-7 w-full max-w-lg mx-4 shadow-2xl"
        style={{ backgroundColor: card, border: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold" style={{ color: text1 }}>Today&apos;s Schedule</h2>
            <p className=" mt-0.5" style={{ color: text2 }}>{todayLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
            style={{ color: text2, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
          >
            ×
          </button>
        </div>

        {/* Summary pills */}
        <div className="flex gap-3 mb-5">
          {[
            { label: "Total", value: todayAppts.length, color: "#711C31" },
            { label: "Confirmed", value: todayAppts.filter(a=>a.status==="CONFIRMED").length, color: "#3DAA7A" },
            { label: "Pending",   value: todayAppts.filter(a=>a.status==="PENDING").length,   color: "#C9922A" },
            { label: "New",       value: todayAppts.filter(a=>a.status==="NEW").length,        color: "#C94A3A" },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: cardInner }}>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] font-semibold mt-0.5" style={{ color: text2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Appointment list */}
        <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
          {todayAppts.length === 0 ? (
            <p className="text-center py-8 italic text-sm" style={{ color: text2 }}>No appointments scheduled for today.</p>
          ) : todayAppts.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ backgroundColor: cardInner, border: `1px solid ${isDark ? "#5C2A3A" : "#D4B896"}` }}
            >
              <div className="flex items-center gap-3">
                <div className="text-center min-w-[40px]">
                  <div className="text-sm font-bold leading-tight" style={{ color: text1 }}>{a.time}</div>
                  <div className="text-[10px]" style={{ color: text2 }}>{a.period}</div>
                </div>
                <div className="w-px h-8" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D4B896" }} />
                <div>
                  <div className="text-sm font-semibold" style={{ color: text1 }}>{a.name}</div>
                  <div className="text-[11px]" style={{ color: text2 }}>{a.type}</div>
                </div>
              </div>
              <span className={statusStyles(a.status)}>{a.status}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          style={{ backgroundColor: "#711C31", color: "#F5ECD7" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Add Patient Modal ─────────────────────────────────────────────────────────

interface AddPatientModalProps {
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
  pageBg: string;
  inputBg: string;
  inputBorder: string;
  addForm: { name:string; email:string; phone:string; specialty:string; date:string; time:string; notes:string };
  setAddForm: React.Dispatch<React.SetStateAction<{ name:string; email:string; phone:string; specialty:string; date:string; time:string; notes:string }>>;
  onClose: () => void;
}

function AddPatientModal({ isDark, card, cardBorder, text1, text2, pageBg, inputBg, inputBorder, addForm, setAddForm, onClose }: AddPatientModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl h-full overflow-y-auto p-8" style={{ backgroundColor: pageBg }}>
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold" style={{ color: isDark ? "#ffffff":"" }}>APPOINTMENTS /</h2>
          <span className="text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#7A6040" }}>Add Patient</span>
        </div>

        <div className={`rounded-2xl p-8 border`} style={{ backgroundColor: card, borderColor: isDark ? "#5C2A3A" : "#D9C9A8" }}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left */}
            <div className="flex flex-col gap-5">
              {[
                { label:"👤 PATIENT NAME",   key:"name",    type:"text",  ph:"Enter Name"       },
                { label:"✉️ EMAIL ADDRESS",  key:"email",   type:"email", ph:"Enter Email"      },
                { label:"📞 PHONE NUMBER",   key:"phone",   type:"tel",   ph:"Contact Number"   },
              ].map(f => (
                <div key={f.key}>
                  <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2" style={{ color: isDark ? "#591727" : "#7A6040" }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.ph}
                    value={(addForm as any)[f.key]}
                    onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                    style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
                  />
                </div>
              ))}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2" style={{ color: isDark ? "#591727" : "#7A6040" }}>➕ SPECIALITIES</label>
                <select
                  value={addForm.specialty}
                  onChange={e => setAddForm(prev => ({ ...prev, specialty: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border appearance-none"
                  style={{ backgroundColor: isDark ? "":"", borderColor: inputBorder, color: addForm.specialty ? text1 : (isDark ? "#591727" : "#7A6040") }}
                >
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
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2" style={{ color: isDark ? "#591727" : "#7A6040" }}>📅 SELECT DATE</label>
                <input
                  type="date"
                  value={addForm.date}
                  onChange={e => setAddForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2" style={{ color: isDark ? "" : "" }}>⏰ SELECT TIME</label>
               <select
  value={addForm.time}
  onChange={e => setAddForm(prev => ({ ...prev, time: e.target.value }))}
  className={`w-full px-4 py-3 rounded-xl text-sm outline-none border appearance-none ${
    isDark
      ? "placeholder:text-[#591727]"
      : "placeholder:text-gray-400"
  }`}
  style={{
    backgroundColor: inputBg,
    borderColor: inputBorder,
    color: addForm.time
      ? text1
      : (isDark ? "#6b444c" : "#ab8b92")
  }}
>
  <option value="">Select Time</option>

  {[
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM"
  ].map(t => (
    <option
      key={t}
      value={t}
      style={{
        backgroundColor: isDark ? "#ffffff" : "#ffffff",
        color: isDark ? "#591727" : "#591727"
      }}
    >
      {t}
    </option>
  ))}
</select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2" style={{ color: isDark ? "#591727" : "#7A6040" }}>📋 NOTES</label>
                <textarea
                  placeholder="Message"
                  value={addForm.notes}
                  onChange={e => setAddForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: isDark ? "#5C2A3A" : "#3D0A1F", color: text1 }}
            >
              Discard Changes
            </button>
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: isDark ? "#591727" : "#3D0A1F" }}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page Component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [showAddPatient,   setShowAddPatient]   = useState(false);
  const [showTodaySchedule, setShowTodaySchedule] = useState(false);
  const [addForm, setAddForm] = useState({
    name:"", email:"", phone:"", specialty:"", date:"", time:"", notes:"",
  });

  // Color tokens
  const card       = isDark ? "#c9a898" : "#EDE0C4";
  const cardBorder = isDark ? "border-[#5C2A3A]" : "border-[#D9C9A8]";
  const cardInner  = isDark ? "#d0baa3" : "#E4D5B8";
  const text1      = isDark ? "#591727" : "#591727";
  const text2      = isDark ? "#591727" : "#591727";
  const barTrack   = isDark ? "#a29b9d" : "#D4C0A4";
  const barFill    = isDark ? "#591727" : "#7A3048";
  const pageBg     = isDark ? "#2A0D18" : "#ffe9bf";
  const inputBg    = isDark ? "#c1a694" : "#ffffff";
  const inputBorder = isDark ? "#5C2A3A" : "#D9C9A8";

  // Today's appointments (dayOffset === 0)
  const todayAppts = useMemo(() => ALL_APPOINTMENTS.filter(a => a.dayOffset === 0), []);

  return (
    <div className="min-h-full ml-10 transition-colors duration-300" style={{ marginTop:"40px" }}>

      {/* ── Modals — defined OUTSIDE render, passed as props ── */}
      {showTodaySchedule && (
        <TodayScheduleModal
          isDark={isDark} card={card} cardBorder={cardBorder}
          cardInner={cardInner} text1={text1} text2={text2}
          onClose={() => setShowTodaySchedule(false)}
        />
      )}
      {showAddPatient && (
        <AddPatientModal
          isDark={isDark} card={card} cardBorder={cardBorder}
          text1={text1} text2={text2} pageBg={pageBg}
          inputBg={inputBg} inputBorder={inputBorder}
          addForm={addForm} setAddForm={setAddForm}
          onClose={() => { setShowAddPatient(false); setAddForm({ name:"", email:"", phone:"", specialty:"", date:"", time:"", notes:"" }); }}
        />
      )}

      {/* ── Top Action Buttons ── */}
      <div className="flex justify-end gap-3 mb-5">
        <button
          onClick={() => setShowTodaySchedule(true)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            isDark
              ? "border-[#FFD52F] text-[#ffffff] hover:bg-[#D4A574] hover:text-[#3D0A1F]"
              : "border-[#711C31] text-[#711C31] hover:bg-[#711C31] hover:text-[#F5ECD7]"
          }`}
        >
          Today&apos;s Schedule
        </button>
        <button
          onClick={() => setShowAddPatient(true)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            isDark
              ? "border-[#FFD52F] text-[#ffffff] hover:bg-[#D4A574] hover:text-[#3D0A1F]"
              : "border-[#711C31] bg-[#591727] text-[#fff] hover:bg-[#711C31] hover:text-[#F5ECD7]"
          }`}
        >
          + Add Patient
        </button>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
  {statCards.map((c) => (
    <div
      key={c.label}
      className={`relative rounded-2xl p-8 border ${cardBorder} transition-colors duration-300 ${isDark ? "bg-[#c9a898]" : "bg-[#ffe9bf]"}`}
    >
      <p className="mb-3" style={{ color: text2 }}>{c.label}</p>

     {/* RIGHT SIDE DECOR LINE */}
{/* RIGHT SIDE DECOR LINE (CAPSULE STYLE) */}
<div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[12px]">
  <div
    className="h-full w-full"
    style={{
      backgroundColor: isDark ? "#5C2A3A" : "#ffe9bf",
      borderTopLeftRadius: "9999px",
      borderBottomLeftRadius: "9999px",
      borderTopRightRadius: "0px",
      borderBottomRightRadius: "0px",
      boxShadow: "inset 2px 0 10px rgba(0,0,0,0.15)",
    }}
  />
</div>

      <div className="flex items-end justify-between gap-2">
        <span
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          {c.value}
        </span>
        <BadgePill badge={c.badge} type={c.badgeType} isDark={isDark} />
      </div>
    </div>
  ))}
</div>

      {/* ── Middle Row: Occupancy + Services ── */}
      <div className="grid grid-cols-[1fr_320px] gap-4 mb-4">

        {/* Clinic Occupancy */}
        <div className={`rounded-2xl p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: text1 }}>Clinic Occupancy</h2>
            <span className="" style={{ color: text2 }}>Peak: Tue 10:00 am</span>
          </div>
          <div className="grid gap-y-1.5">
            <div className="grid grid-cols-[44px_repeat(7,1fr)] gap-1">
              <div />
              {DAYS.map(d => <div key={d} className="text-[10px] text-center font-semibold" style={{ color: text2 }}>{d}</div>)}
            </div>
            {TIMES.map((t, ti) => (
              <div key={t} className="grid grid-cols-[44px_repeat(7,1fr)] gap-1 items-center">
                <span className="text-[10px]" style={{ color: text2 }}>{t}</span>
                {occupancyData[ti].map((level, di) => <OccupancyCell key={di} level={level} isDark={isDark} />)}
              </div>
            ))}
          </div>
        </div>

        {/* Services Taken */}
        <div className={`rounded-2xl p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
          <h2 className="text-lg font-semibold mb-5" style={{ color: text1 }}>Services taken</h2>
          <div className="flex flex-col gap-4">
            {services.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="" style={{ color: text1 }}>{s.name}</span>
                  <span className=" font-semibold" style={{ color: "var(--font-cinzel)" }}>{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: barTrack }}>
                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width:`${s.pct}%`, backgroundColor: barFill }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="" style={{ color: text2 }}>Top Performer</span>
            <span className=" font-semibold px-3 py-1 rounded-lg" style={{ backgroundColor: cardInner, color: text1 }}>Aligneurs</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-[1fr_320px] gap-4">

        {/* Left: Appointments + Doctor Productivity */}
        <div className="flex flex-col gap-4">

          {/* Upcoming Appointments */}
          <div className={`rounded-2xl p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: text1 }}>Upcoming Appointments</h2>
              <div className="flex rounded-lg overflow-hidden  border" style={{ borderColor: isDark ? "#5C2A3A" : "#D4B896" }}>
                <button className="px-3 py-1.5 font-semibold transition-colors" style={{ backgroundColor: cardInner, color: text1 }}>List</button>
                <button className="px-3 py-1.5 transition-colors" style={{ backgroundColor:"transparent", color: text2 }}>Calendar</button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {todayAppts.map((a, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${cardBorder}`} style={{ backgroundColor: cardInner }}>
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[36px]">
                      <div className="text-sm font-bold leading-tight" style={{ color: text1 }}>{a.time}</div>
                      <div className="text-[10px]" style={{ color: text2 }}>{a.period}</div>
                    </div>
                    <div className="w-px h-8" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D4B896" }} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: text1 }}>{a.name}</div>
                      <div className="text-[11px]" style={{ color: text2 }}>{a.type}</div>
                    </div>
                  </div>
                  <span className={statusStyles(a.status)}>{a.status}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? "#D4A574" : "#3D0A1F" }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D4B896" }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D4B896" }} />
            </div>
          </div>

          {/* Doctor Productivity */}
          <div className={`rounded-2xl p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: text1 }}>Doctor Productivity</h2>
              <button className=" font-semibold" style={{ color: isDark ? "#591727" : "#7A3048" }}>View All Staff</button>
            </div>
            <div className="grid grid-cols-[1fr_120px_160px] px-3 py-2 rounded-lg mb-2 text-[10px] font-semibold tracking-wider uppercase" style={{ backgroundColor: cardInner, color: text2 }}>
              <span>Staff</span><span className="text-center">Patients Seen</span><span className="text-center">Avg. Procedure Time</span>
            </div>
            <div className="flex flex-col gap-1">
              {staff.map((s, i) => (
                <div key={i} className={`grid grid-cols-[1fr_120px_160px] items-center px-3 py-2.5 rounded-xl border ${cardBorder}`} style={{ backgroundColor: cardInner }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center  font-bold shrink-0" style={{ backgroundColor: isDark ? "#6B2A40" : "#8B5060", color:"#F5ECD7" }}>{s.avatar}</div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: text1 }}>{s.name}</div>
                      <div className="text-[11px]" style={{ color: text2 }}>{s.role}</div>
                    </div>
                  </div>
                  <div className="text-center text-sm font-semibold" style={{ color: "var(--font-cinzel)", }}>{s.seen}</div>
                  <div className="text-center text-sm" style={{ color: "var(--font-cinzel)", }}>{s.avg}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? "#D4A574" : "#3D0A1F" }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D4B896" }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D4B896" }} />
            </div>
          </div>
        </div>

        {/* Right: Patient Overview + Pending Confirmations */}
        <div className="flex flex-col gap-4">

          {/* Patient Overview */}
          <div className={`rounded-2xl p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: text2 }}>Patient Overview</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: isDark ? "#6B2A40" : "#8B5060", color:"#F5ECD7" }}>S</div>
              <div>
                <div className="text-base font-semibold" style={{ color: text1 }}>Next Patient</div>
                <div className="text-[11px]" style={{ color: text2 }}>Arriving in 15 mins</div>
              </div>
            </div>
            <div className="flex flex-col gap-2  mb-4">
              {[
                { label:"Patient Name:", value:"Sarah Jenkins",  isTag:false },
                { label:"Patient ID:",   value:"#PX-4920",       isTag:false },
                { label:"Last Visit:",   value:"Aug 12, 2023",   isTag:false },
                { label:"Medical Alerts:", value:"⚠ Allergies", isTag:true  },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span style={{ color: text2 }}>{row.label}</span>
                  {row.isTag
                    ? <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#C9922A] text-white">{row.value}</span>
                    : <span className="font-semibold" style={{ color: text1 }}>{row.value}</span>}
                </div>
              ))}
            </div>
            <button className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors ${isDark ? "border-[#FFD52F] text-[#711C31] hover:bg-[#D4A574] hover:text-[#3D0A1F]" : "border-[#3D0A1F] text-[#3D0A1F] hover:bg-[#3D0A1F] hover:text-[#F5ECD7]"}`}>
              Open Clinical File ↗
            </button>
          </div>

          {/* Pending Confirmations */}
          <div className={`rounded-2xl p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-base font-semibold" style={{ color: "var(--font-cinzel)", }}>Pending Confirmations</h2>
              <span className="w-5 h-5 rounded-full bg-[#8B1A2E] text-white text-[10px] font-bold flex items-center justify-center">{pendingConfirmations.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {pendingConfirmations.map((p, i) => (
                <div key={i} className={`rounded-xl p-3 border ${cardBorder}`} style={{ backgroundColor: cardInner }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold" style={{ color: text1 }}>{p.name}</span>
                    <span className="text-[10px]" style={{ color: text2 }}>{p.timeAgo}</span>
                  </div>
                  <p className="text-[11px] mb-2.5" style={{ color: text2 }}>{p.service} · {p.date}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 rounded-lg bg-[#3D0A1F] text-[#F5ECD7]  font-semibold hover:bg-[#5C1A30] transition-colors">Call</button>
                    <button className={`flex-1 py-1.5 rounded-lg  font-semibold border transition-colors ${isDark ? "border-[#FFD52F] text-[#711C31] hover:bg-[#D4A574] hover:text-[#3D0A1F]" : "border-[#3D0A1F] text-[#3D0A1F] hover:bg-[#3D0A1F] hover:text-[#F5ECD7]"}`}>Confirm</button>
                  </div>
                </div>
              ))}
            </div>
            <button className={`w-full mt-4 py-2  font-semibold border rounded-xl transition-colors ${isDark ? "border-[#FFD52F] text-[#711C31] hover:bg-[#D4A574] hover:text-[#3D0A1F]" : "border-[#3D0A1F] text-[#3D0A1F] hover:bg-[#3D0A1F] hover:text-[#F5ECD7]"}`}>
              View all Requests ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
