"use client";

import { useState, useCallback } from "react";
import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { getToken, getAdmin } from "@/utils/auth";
import { apiUrl } from "@/utils/api";
import {
  DEFAULT_DASHBOARD_OVERVIEW,
  DEFAULT_NEXT_PATIENT,
  type DashboardOverview,
  type DisplayAppointment,
} from "@/utils/dashboardData";
import {
  chunkIntoGroups,
  getCarouselSlideStyle,
  getCarouselTrackStyle,
  useAutoCarousel,
} from "@/utils/carousel";

const DAYS  = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const TIMES = ["08:00","10:00","12:00","14:00","16:00","18:00"];
const CAROUSEL_DOTS = 3;

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusStyles(status: string) {
  switch (status) {
    case "CONFIRMED": return "text-[#3DAA7A] border border-[#3DAA7A] bg-[#D1FAE5] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "PENDING":   return "text-[#686868] border border-[#D3D3D3] bg-[#F0F0F0] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "NEW":       return "text-[#C94A3A] border border-[#C94A3A] bg-[#bfafaa] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    default:          return "";
  }
}

function OccupancyCell({ level, isDark }: { level: number; isDark: boolean }) {
  if (level === 0) return <div className="h-5 rounded-sm" style={{ backgroundColor: isDark ? "#3D1525" : "#d3d3d3" }} />;
  const darkColors  = ["","#7A5560","#9B6B7A","#8B3A52","#6B1A30"];
  const lightColors = ["","#591727","#C4A090","#A87878","#711C31"];
  return <div className="h-5 rounded-sm" style={{ backgroundColor: isDark ? darkColors[level] : lightColors[level] }} />;
}

function BadgePill({ badge, type, isDark }: { badge: string; type: string; isDark: boolean }) {
  const styles: Record<string,string> = {
    negative: isDark ? "bg-[#711C314D] text-[#591727]":"bg-[#711C314D] text-[#591727]",
    warning:  isDark ? "bg-[#711C314D] text-[#591727]" : "bg-[#711C314D] text-[#591727]",
    neutral:  isDark ? "bg-[#711C314D] text-[#591727]" : "bg-[#711C314D] text-[#591727]",
  };
  return <span className={`text-[10px] px-5 py-2 rounded-full whitespace-nowrap ${styles[type]}`}>{badge}</span>;
}

// ── Today's Schedule Modal ────────────────────────────────────────────────────

interface ScheduleModalProps {
  isDark: boolean;
  card: string;
  cardBorder: string;
  cardInner: string;
  text1: string;
  text2: string;
  todayAppointments: DisplayAppointment[];
  onClose: () => void;
}

function TodayScheduleModal({ isDark, card, cardBorder, cardInner, text1, text2, todayAppointments, onClose }: ScheduleModalProps) {
  const today = new Date();
  const days  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months= ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const todayLabel = `${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

  const todayAppts = todayAppointments;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative rounded-2xl p-7 w-full max-w-lg mx-4 shadow-2xl"
        style={{ backgroundColor: card, border: `1px solid ${isDark ? "#5C2A3A" : "#711C31"}` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold" style={{ color: text1 }}>Today&apos;s Schedule</h2>
            <p className="mt-0.5 text-sm" style={{ color: text2 }}>{todayLabel}</p>
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
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { label: "Total", value: todayAppts.length, color: "#711C31" },
            { label: "Confirmed", value: todayAppts.filter(a=>a.status==="CONFIRMED").length, color: "#3DAA7A" },
            { label: "Pending",   value: todayAppts.filter(a=>a.status==="PENDING").length,   color: "#686868" },
            { label: "New",       value: todayAppts.filter(a=>a.status==="NEW").length,        color: "#C94A3A" },
          ].map(s => (
            <div key={s.label} className="flex-1 min-w-[60px] rounded-xl p-3 text-center" style={{ backgroundColor: cardInner }}>
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
              className="flex items-center justify-between p-3 rounded-xl gap-2"
              style={{ backgroundColor: cardInner, border: `1px solid ${isDark ? "#711C31" : "#711C31"}` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-center min-w-[40px] shrink-0">
                  <div className="text-sm font-bold leading-tight" style={{ color: text1 }}>{a.time}</div>
                  <div className="text-[10px]" style={{ color: text2 }}>{a.period}</div>
                </div>
                <div className="w-px h-8 shrink-0" style={{ backgroundColor: isDark ? "#711C31" : "#711C31" }} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: text1 }}>{a.name}</div>
                  <div className="text-[11px] truncate" style={{ color: text2 }}>{a.type}</div>
                </div>
              </div>
              <span className={`${statusStyles(a.status)} shrink-0`}>{a.status}</span>
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
  onBook: () => void;
  booking: boolean;
}

function AddPatientModal({ isDark, card, cardBorder, text1, text2, pageBg, inputBg, inputBorder, addForm, setAddForm, onClose, onBook, booking }: AddPatientModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl h-full overflow-y-auto p-4 sm:p-8" style={{ backgroundColor: pageBg }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#ffffff":"" }}>APPOINTMENTS /</h2>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#7A6040" }}>Add Patient</span>
        </div>

        <div className={`rounded-2xl p-4 sm:p-8 border`} style={{ backgroundColor: card, borderColor: isDark ? "#5C2A3A" : "#753141" }}>
          {/* On mobile: single column; on sm+: two columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    "08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM",
                    "01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"
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

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: isDark ? "#5C2A3A" : "#3D0A1F", color: text1 }}
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={onBook}
              disabled={booking}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: isDark ? "#591727" : "#3D0A1F", opacity: booking ? 0.7 : 1 }}
            >
              {booking ? "Booking..." : "Book Appointment"}
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

    const router = useRouter();

  useEffect(() => {
    const validateAdmin = async () => {
      const token = getToken();
      const admin = getAdmin();

      // Not logged in
      if (!token || !admin) {
        router.push("/login");
        return;
      }

      // Not admin
      if (admin.role !== "admin") {
        router.push("/unauthorized");
        return;
      }

      try {
        const response = await fetch(apiUrl("/api/auth/dashboard"), {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Invalid or expired token
        if (!response.ok) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/login");
      }
    };

    validateAdmin();
  }, [router]);

  const [dashboard, setDashboard] = useState<DashboardOverview>(DEFAULT_DASHBOARD_OVERVIEW);
  const [showAddPatient,   setShowAddPatient]   = useState(false);
  const [showTodaySchedule, setShowTodaySchedule] = useState(false);
  const [booking, setBooking] = useState(false);
  const [addForm, setAddForm] = useState({
    name:"", email:"", phone:"", specialty:"", date:"", time:"", notes:"",
  });

  const fetchDashboardOverview = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(apiUrl("/api/statistics/overview"), {
        headers: authHeaders(),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          setDashboard({
            statCards: json.data.statCards ?? DEFAULT_DASHBOARD_OVERVIEW.statCards,
            occupancyData: json.data.occupancyData ?? DEFAULT_DASHBOARD_OVERVIEW.occupancyData,
            occupancyPeak: json.data.occupancyPeak ?? DEFAULT_DASHBOARD_OVERVIEW.occupancyPeak,
            services: json.data.services?.length ? json.data.services : DEFAULT_DASHBOARD_OVERVIEW.services,
            topPerformer: json.data.topPerformer ?? DEFAULT_DASHBOARD_OVERVIEW.topPerformer,
            todayAppointments: json.data.todayAppointments ?? [],
            staff: json.data.staff?.length ? json.data.staff : DEFAULT_DASHBOARD_OVERVIEW.staff,
            pendingConfirmations: json.data.pendingConfirmations ?? [],
            nextPatient: json.data.nextPatient ?? null,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard overview:", error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!cancelled) await fetchDashboardOverview();
    };

    load();
    const intervalId = window.setInterval(load, 5000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchDashboardOverview]);

  const handleConfirmAppointment = async (id: string) => {
    try {
      const response = await fetch(apiUrl(`/api/statistics/appointments/${id}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ status: "CONFIRMED" }),
      });
      if (response.ok) await fetchDashboardOverview();
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
    }
  };

  const handleBookAppointment = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.specialty || !addForm.date || !addForm.time) {
      return;
    }

    setBooking(true);
    try {
      const response = await fetch(apiUrl("/api/statistics/appointments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: addForm.name,
          email: addForm.email,
          phone: addForm.phone,
          specialty: addForm.specialty,
          appointmentDate: addForm.date,
          appointmentTime: addForm.time,
          notes: addForm.notes,
          isNewPatient: true,
        }),
      });

      if (response.ok) {
        setShowAddPatient(false);
        setAddForm({ name:"", email:"", phone:"", specialty:"", date:"", time:"", notes:"" });
        await fetchDashboardOverview();
      }
    } catch (error) {
      console.error("Failed to book appointment:", error);
    } finally {
      setBooking(false);
    }
  };

  const {
    statCards,
    occupancyData,
    occupancyPeak,
    services,
    topPerformer,
    todayAppointments,
    staff,
    pendingConfirmations,
    nextPatient,
  } = dashboard;
  const todayGroups = chunkIntoGroups(todayAppointments, 3);
  const staffGroups = chunkIntoGroups(staff, 3);
  const todayUsesCarousel = todayGroups.length > 1;
  const staffUsesCarousel = staffGroups.length > 1;
  const todayCarousel = useAutoCarousel(
    todayUsesCarousel ? todayGroups.length : CAROUSEL_DOTS,
    4000,
    todayAppointments.length > 0
  );
  const staffCarousel = useAutoCarousel(
    staffUsesCarousel ? staffGroups.length : CAROUSEL_DOTS,
    4000,
    staff.length > 0
  );

  const patientOverview = nextPatient ?? DEFAULT_NEXT_PATIENT;

  // Color tokens
  const card       = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder = isDark ? "border-[#753141]" : "border-[#753141]";
  const cardInner  = isDark ? "#d0baa3" : "#FFFFFF";
  const text1      = isDark ? "#591727" : "#591727";
  const text2      = isDark ? "#591727" : "#591727";
  const barTrack   = isDark ? "#a29b9d" : "#D4C0A4";
  const barFill    = isDark ? "#591727" : "#7A3048";
  const pageBg     = isDark ? "#2A0D18" : "#FFFFFF";
  const inputBg    = isDark ? "#c1a694" : "#ffffff";
  const inputBorder = isDark ? "#753141" : "#753141";

  return (
    <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0" style={{ marginTop:"40px" }}>

      {/* ── Modals ── */}
      {showTodaySchedule && (
        <TodayScheduleModal
          isDark={isDark} card={card} cardBorder={cardBorder}
          cardInner={cardInner} text1={text1} text2={text2}
          todayAppointments={todayAppointments}
          onClose={() => setShowTodaySchedule(false)}
        />
      )}
      {showAddPatient && (
        <AddPatientModal
          isDark={isDark} card={card} cardBorder={cardBorder}
          text1={text1} text2={text2} pageBg={pageBg}
          inputBg={inputBg} inputBorder={inputBorder}
          addForm={addForm} setAddForm={setAddForm}
          onBook={handleBookAppointment}
          booking={booking}
          onClose={() => { setShowAddPatient(false); setAddForm({ name:"", email:"", phone:"", specialty:"", date:"", time:"", notes:"" }); }}
        />
      )}

      {/* ── Top Action Buttons ── */}
      <div className="flex justify-end gap-3 mb-5 flex-wrap">
        <button
          onClick={() => setShowTodaySchedule(true)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            isDark
              ? "border-[#FFFFFF] text-[#ffffff] hover:bg-[#c9a898] hover:text-[#3D0A1F]"
              : "border-[#711C31] text-[#711C31] hover:bg-[#711C31] hover:text-[#F5ECD7]"
          }`}
        >
          Today&apos;s Schedule
        </button>
        <button
          onClick={() => setShowAddPatient(true)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
            isDark
              ? "border-[#FFFFFF] text-[#ffffff] hover:bg-[#c9a898] hover:text-[#3D0A1F]"
              : "border-[#711C31] bg-[#591727] text-[#fff] hover:bg-[#711C31] hover:text-[#F5ECD7]"
          }`}
        >
          + Add Patient
        </button>
      </div>

      {/* ── Stat Cards Row ── */}
      {/* Mobile: 1 col, sm: 3 cols (unchanged on lg+) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {statCards.map((c) => (
          <div
            key={c.label}
            className={`relative rounded-2xl p-6 sm:p-8 border ${cardBorder} transition-colors duration-300 ${isDark ? "bg-[#c9a898]" : "bg-[#D3D3D3]"}`}
          >
            <p className="mb-3" style={{ color: text2 }}>{c.label}</p>

            {/* RIGHT SIDE DECOR LINE (CAPSULE STYLE) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[12px]">
              <div
                className="h-full w-full"
                style={{
                  backgroundColor: isDark ? "#c9a898" : "#d3d3d3",
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
      {/* Mobile/tablet: stacked; lg+: side by side (unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 mb-4">

        {/* Clinic Occupancy */}
        <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder} transition-colors duration-300 overflow-x-auto`} style={{ backgroundColor: card }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold" style={{ color: text1 }}>Clinic Occupancy</h2>
            <span style={{ color: text2 }}>{occupancyPeak}</span>
          </div>
          {/* Allow horizontal scroll on very small screens */}
          <div className="min-w-[320px]">
            <div className="grid gap-y-1.5">
              <div className="grid grid-cols-[44px_repeat(7,1fr)] gap-1">
                <div />
                {DAYS.map(d => <div key={d} className="text-[10px] text-center font-semibold" style={{ color: text2 }}>{d}</div>)}
              </div>
              {TIMES.map((t, ti) => (
                <div key={t} className="grid grid-cols-[44px_repeat(7,1fr)] gap-1 items-center numeric-font font-bold">
                  <span className="text-[11px] font-bold numeric-font" style={{ color: text2 }}>{t}</span>
                  {occupancyData[ti].map((level, di) => <OccupancyCell key={di} level={level} isDark={isDark} />)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Taken */}
        <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
          <h2 className="text-lg font-semibold mb-5" style={{ color: text1 }}>Services taken</h2>
          <div className="flex flex-col gap-4">
            {services.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ color: text1 }}>{s.name}</span>
                  <span className="font-semibold numeric-font" style={{ color: "var(--font-cinzel)" }}>{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: "#a87c86" }}>
                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width:`${s.pct}%`, backgroundColor: "#711C31" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span style={{ color: text2 }}>Top Performer</span>
            <span className="font-semibold px-3 py-1 rounded-lg" style={{ backgroundColor: cardInner, color: text1 }}>{topPerformer}</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      {/* Mobile/tablet: stacked; lg+: side by side (unchanged) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

        {/* Left: Appointments + Doctor Productivity */}
        <div className="flex flex-col gap-4">

          {/* Upcoming Appointments */}
          <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-semibold" style={{ color: text1 }}>Upcoming Appointments</h2>
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: isDark ? "#5C2A3A" : "#D4B896" }}>
                <button className="px-3 py-1.5 font-semibold transition-colors" style={{ backgroundColor: cardInner, color: text1 }}>List</button>
                <button className="px-3 py-1.5 transition-colors" style={{ backgroundColor:"transparent", color: text2 }}>Calendar</button>
              </div>
            </div>
            <div
              className="flex flex-col gap-3"
              onMouseEnter={todayCarousel.onMouseEnter}
              onMouseLeave={todayCarousel.onMouseLeave}
            >
              {todayUsesCarousel ? (
                <div className="overflow-hidden w-full">
                  <div style={getCarouselTrackStyle(todayCarousel.slide, todayGroups.length)}>
                    {todayGroups.map((group, gi) => (
                      <div key={gi} className="flex flex-col gap-3" style={getCarouselSlideStyle(todayGroups.length)}>
                        {group.map((a, i) => (
                          <div key={a.id ?? `${gi}-${i}`} className={`flex items-center justify-between p-3 rounded-xl border ${cardBorder} gap-2`} style={{ backgroundColor: cardInner }}>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-center min-w-[36px] shrink-0">
                                <div className="text-sm font-bold leading-tight numeric-font" style={{ color: text1 }}>{a.time}</div>
                                <div className="text-[10px]" style={{ color: text2 }}>{a.period}</div>
                              </div>
                              <div className="w-px h-8 shrink-0" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D4B896" }} />
                              <div className="min-w-0">
                                <div className="text-sm font-semibold truncate" style={{ color: text1 }}>{a.name}</div>
                                <div className="text-[11px] truncate" style={{ color: text2 }}>{a.type}</div>
                              </div>
                            </div>
                            <span className={`${statusStyles(a.status)} shrink-0`}>{a.status}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                todayAppointments.map((a, i) => (
                  <div key={a.id ?? i} className={`flex items-center justify-between p-3 rounded-xl border ${cardBorder} gap-2`} style={{ backgroundColor: cardInner }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-center min-w-[36px] shrink-0">
                        <div className="text-sm font-bold leading-tight numeric-font" style={{ color: text1 }}>{a.time}</div>
                        <div className="text-[10px]" style={{ color: text2 }}>{a.period}</div>
                      </div>
                      <div className="w-px h-8 shrink-0" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D4B896" }} />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: text1 }}>{a.name}</div>
                        <div className="text-[11px] truncate" style={{ color: text2 }}>{a.type}</div>
                      </div>
                    </div>
                    <span className={`${statusStyles(a.status)} shrink-0`}>{a.status}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              {todayUsesCarousel ? (
                todayGroups.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => todayCarousel.setSlide(idx)}
                    className={`${todayCarousel.slide === idx ? "w-5 h-1.5" : "w-1.5 h-1.5"} rounded-full transition-all duration-300`}
                    style={{ backgroundColor: todayCarousel.slide === idx ? (isDark ? "#D4A574" : "#3D0A1F") : (isDark ? "#5C2A3A" : "#D4B896") }}
                    aria-label={`Show appointments group ${idx + 1}`}
                  />
                ))
              ) : (
                Array.from({ length: CAROUSEL_DOTS }, (_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => todayCarousel.setSlide(idx)}
                    className={`${todayCarousel.slide === idx ? "w-5 h-1.5" : "w-1.5 h-1.5"} rounded-full transition-all duration-300`}
                    style={{ backgroundColor: todayCarousel.slide === idx ? (isDark ? "#D4A574" : "#3D0A1F") : (isDark ? "#5C2A3A" : "#D4B896") }}
                    aria-hidden={todayAppointments.length === 0}
                    tabIndex={todayAppointments.length === 0 ? -1 : 0}
                  />
                ))
              )}
            </div>
          </div>

          {/* Doctor Productivity */}
          <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-semibold" style={{ color: text1 }}>Doctor Productivity</h2>
              <button className="font-semibold" style={{ color: isDark ? "#591727" : "#7A3048" }}>View All Staff</button>
            </div>

            {/* Header row — hidden on very small, shown on sm+ */}
            <div className="hidden sm:grid grid-cols-[1fr_120px_160px] px-3 py-2 rounded-lg mb-2 text-[10px] font-semibold tracking-wider uppercase" style={{ backgroundColor: cardInner, color: text2 }}>
              <span>Staff</span><span className="text-center">Patients Seen</span><span className="text-center">Avg. Procedure Time</span>
            </div>

            <div
              className="flex flex-col gap-1"
              onMouseEnter={staffCarousel.onMouseEnter}
              onMouseLeave={staffCarousel.onMouseLeave}
            >
              {staffUsesCarousel ? (
                <div className="overflow-hidden w-full">
                  <div style={getCarouselTrackStyle(staffCarousel.slide, staffGroups.length)}>
                    {staffGroups.map((group, gi) => (
                      <div key={gi} className="flex flex-col gap-1" style={getCarouselSlideStyle(staffGroups.length)}>
                        {group.map((s, i) => (
                          <div
                            key={`${s.name}-${gi}-${i}`}
                            className={`flex flex-col sm:grid sm:grid-cols-[1fr_120px_160px] items-start sm:items-center px-3 py-3 rounded-xl border gap-2 sm:gap-0 ${cardBorder}`}
                            style={{ backgroundColor: cardInner }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0" style={{ backgroundColor: isDark ? "#6B2A40" : "#8B5060", color:"#F5ECD7" }}>{s.avatar}</div>
                              <div>
                                <div className="text-sm font-semibold" style={{ color: text1 }}>{s.name}</div>
                                <div className="text-[11px]" style={{ color: text2 }}>{s.role}</div>
                              </div>
                            </div>
                            <div className="flex sm:contents gap-4 pl-11 sm:pl-0 text-sm">
                              <div className="sm:text-center">
                                <span className="sm:hidden text-[10px] font-semibold uppercase mr-1" style={{ color: text2 }}>Seen:</span>
                                <span className="font-semibold numeric-font" style={{ color: "var(--font-cinzel)" }}>{s.seen}</span>
                              </div>
                              <div className="sm:text-center">
                                <span className="sm:hidden text-[10px] font-semibold uppercase mr-1" style={{ color: text2 }}>Avg:</span>
                                <span style={{ color: "var(--font-cinzel)" }}>{s.avg}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                staff.map((s, i) => (
                  <div
                    key={i}
                    className={`flex flex-col sm:grid sm:grid-cols-[1fr_120px_160px] items-start sm:items-center px-3 py-3 rounded-xl border gap-2 sm:gap-0 ${cardBorder}`}
                    style={{ backgroundColor: cardInner }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0" style={{ backgroundColor: isDark ? "#6B2A40" : "#8B5060", color:"#F5ECD7" }}>{s.avatar}</div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: text1 }}>{s.name}</div>
                        <div className="text-[11px]" style={{ color: text2 }}>{s.role}</div>
                      </div>
                    </div>
                    <div className="flex sm:contents gap-4 pl-11 sm:pl-0 text-sm">
                      <div className="sm:text-center">
                        <span className="sm:hidden text-[10px] font-semibold uppercase mr-1" style={{ color: text2 }}>Seen:</span>
                        <span className="font-semibold numeric-font" style={{ color: "var(--font-cinzel)" }}>{s.seen}</span>
                      </div>
                      <div className="sm:text-center">
                        <span className="sm:hidden text-[10px] font-semibold uppercase mr-1" style={{ color: text2 }}>Avg:</span>
                        <span style={{ color: "var(--font-cinzel)" }}>{s.avg}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-center gap-1.5 mt-4">
              {staffUsesCarousel ? (
                staffGroups.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => staffCarousel.setSlide(idx)}
                    className={`${staffCarousel.slide === idx ? "w-5 h-1.5" : "w-1.5 h-1.5"} rounded-full transition-all duration-300`}
                    style={{ backgroundColor: staffCarousel.slide === idx ? (isDark ? "#D4A574" : "#3D0A1F") : (isDark ? "#5C2A3A" : "#D4B896") }}
                    aria-label={`Show staff group ${idx + 1}`}
                  />
                ))
              ) : (
                Array.from({ length: CAROUSEL_DOTS }, (_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => staffCarousel.setSlide(idx)}
                    className={`${staffCarousel.slide === idx ? "w-5 h-1.5" : "w-1.5 h-1.5"} rounded-full transition-all duration-300`}
                    style={{ backgroundColor: staffCarousel.slide === idx ? (isDark ? "#D4A574" : "#3D0A1F") : (isDark ? "#5C2A3A" : "#D4B896") }}
                    aria-hidden={staff.length === 0}
                    tabIndex={staff.length === 0 ? -1 : 0}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Patient Overview + Pending Confirmations */}
        <div className="flex flex-col gap-4">

          {/* Patient Overview */}
          <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: text2 }}>Patient Overview</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: isDark ? "#6B2A40" : "#8B5060", color:"#F5ECD7" }}>{patientOverview.initials}</div>
              <div>
                <div className="text-base font-semibold" style={{ color: text1 }}>Next Patient</div>
                <div className="text-[11px]" style={{ color: text2 }}>{patientOverview.subtitle}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {patientOverview.rows.map(row => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <span style={{ color: text2 }}>{row.label}</span>
                  {row.isTag
                    ? <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#9e9e9e] text-[#591727]">{row.value}</span>
                    : <span className="font-semibold text-right" style={{ color: text1 }}>{row.value}</span>}
                </div>
              ))}
            </div>
            <button className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors ${isDark ? "border-[#711C31] text-[#711C31] hover:bg-[#D4A574] hover:text-[#3D0A1F]" : "border-[#3D0A1F] text-[#3D0A1F] hover:bg-[#3D0A1F] hover:text-[#F5ECD7]"}`}>
              Open Clinical File ↗
            </button>
          </div>

          {/* Pending Confirmations */}
          <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder} transition-colors duration-300`} style={{ backgroundColor: card }}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-base font-semibold" style={{ color: "var(--font-cinzel)" }}>Pending Confirmations</h2>
              <span className="w-5 h-5 rounded-full bg-[#8B1A2E] text-white text-[10px] font-bold flex items-center justify-center shrink-0">{pendingConfirmations.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {pendingConfirmations.length === 0 ? (
                <p className="text-center py-6 italic text-sm" style={{ color: text2 }}>No pending confirmations.</p>
              ) : pendingConfirmations.map((p) => (
                <div key={p.id} className={`rounded-xl p-3 border ${cardBorder}`} style={{ backgroundColor: cardInner }}>
                  <div className="flex items-center justify-between mb-0.5 gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: text1 }}>{p.name}</span>
                    <span className="text-[10px] shrink-0" style={{ color: text2 }}>{p.timeAgo}</span>
                  </div>
                  <p className="text-[11px] mb-2.5" style={{ color: text2 }}>{p.service} · {p.date}</p>
                  <div className="flex gap-2">
                    <button type="button" className="flex-1 py-1.5 rounded-lg bg-[#3D0A1F] text-[#F5ECD7] font-semibold hover:bg-[#5C1A30] transition-colors text-sm">Call</button>
                    <button
                      type="button"
                      onClick={() => handleConfirmAppointment(p.id)}
                      className={`flex-1 py-1.5 rounded-lg font-semibold border transition-colors text-sm ${isDark ? "border-[#711C31] text-[#711C31] hover:bg-[#D4A574] hover:text-[#3D0A1F]" : "border-[#3D0A1F] text-[#3D0A1F] hover:bg-[#3D0A1F] hover:text-[#F5ECD7]"}`}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className={`w-full mt-4 py-2 font-semibold border rounded-xl transition-colors text-sm ${isDark ? "border-[#711C31] text-[#711C31] hover:bg-[#D4A574] hover:text-[#3D0A1F]" : "border-[#3D0A1F] text-[#3D0A1F] hover:bg-[#3D0A1F] hover:text-[#F5ECD7]"}`}>
              View all Requests ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
