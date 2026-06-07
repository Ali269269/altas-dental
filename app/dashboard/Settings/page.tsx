"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAdminProfile } from "@/context/AdminProfileContext";
import { usePermissions } from "@/context/PermissionsContext";
import { getToken, getAdmin, setAuth } from "@/utils/auth";
import type { AlertPreferences, BusinessHourEntry, SettingsOverview } from "@/utils/settingsData";
import { DEFAULT_SETTINGS_OVERVIEW } from "@/utils/settingsData";
import {
  changeSettingsPassword,
  fetchSettingsOverview,
  removeSettingsProfilePhoto,
  updateSettingsAlerts,
  updateSettingsBusinessHours,
  updateSettingsClinic,
  updateSettingsProfile,
  updateSettingsSecurity,
  uploadSettingsProfilePhoto,
} from "@/utils/settingsApi";

function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function PasswordField({
  label,
  value,
  onChange,
  inputSt,
  brandColor,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputSt: React.CSSProperties;
  brandColor: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: brandColor }}>
        {label}
      </p>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm border outline-none"
          style={inputSt}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/5"
          aria-label={visible ? "Hide password" : "Show password"}
          style={{ color: brandColor }}
        >
          {visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, color = "#3DAA7A", disabled = false }: { checked: boolean; onChange: (v: boolean) => void; color?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50"
      style={{
        width: 44, height: 24,
        backgroundColor: checked ? color : "rgba(255,255,255,0.25)",
        border: "2px solid rgba(255,255,255,0.3)",
      }}
    >
      <span
        className="inline-block rounded-full bg-white shadow transition-transform duration-200"
        style={{
          width: 18, height: 18,
          transform: checked ? "translateX(20px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

function ToggleBlue({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50"
      style={{
        width: 44, height: 24,
        backgroundColor: checked ? "#bf1515" : "#D1D5DB",
        border: "none",
      }}
    >
      <span
        className="inline-block rounded-full bg-white shadow transition-transform duration-200"
        style={{
          width: 18, height: 18,
          transform: checked ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

function HoursModal({
  entry, onSave, onClose, isDark, brandColor, borderCol, saving,
}: {
  entry: BusinessHourEntry;
  onSave: (e: BusinessHourEntry) => void | Promise<void>;
  onClose: () => void;
  isDark: boolean;
  brandColor: string;
  borderCol: string;
  saving?: boolean;
}) {
  const [start, setStart] = useState(entry.start);
  const [end, setEnd] = useState(entry.end);
  const [closed, setClosed] = useState(entry.closed);
  const inputSt = {
    backgroundColor: isDark ? "#d0baa3" : "#ffffff",
    borderColor: borderCol,
    color: brandColor,
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl p-6 w-80 max-w-[calc(100vw-2rem)] shadow-2xl"
        style={{ backgroundColor: isDark ? "#c9a898" : "#ffffff", border: `1px solid ${borderCol}` }}>
        <h3 className="text-base font-bold mb-4" style={{ color: brandColor }}>{entry.label} Hours</h3>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" checked={closed} onChange={e => setClosed(e.target.checked)}
            className="w-4 h-4 accent-[#591727]" />
          <span className="text-sm" style={{ color: brandColor }}>Closed</span>
        </label>
        {!closed && (
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: brandColor }}>Open</p>
              <input type="time" value={start} onChange={e => setStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                style={inputSt} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: brandColor }}>Close</p>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                style={inputSt} />
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 rounded-xl text-sm border font-semibold disabled:opacity-50"
            style={{ borderColor: borderCol, color: brandColor, backgroundColor: "transparent" }}>
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={async () => {
              await onSave({ ...entry, start, end, closed });
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: brandColor }}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

function ChangePasswordModal({
  onClose, onSubmit, isDark, brandColor, borderCol,
}: {
  onClose: () => void;
  onSubmit: (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  isDark: boolean;
  brandColor: string;
  borderCol: string;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputSt = { backgroundColor: isDark ? "#d0baa3" : "#ffffff", borderColor: borderCol, color: brandColor };

  const handleSave = async () => {
    setError("");
    if (!next || next !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ currentPassword: current, newPassword: next, confirmPassword: confirm });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl p-6 w-96 max-w-[calc(100vw-2rem)] shadow-2xl"
        style={{ backgroundColor: isDark ? "#c9a898" : "#ffffff", border: `1px solid ${borderCol}` }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: brandColor }}>Change Password</h3>
          <button type="button" onClick={onClose} className="text-lg font-bold" style={{ color: brandColor }}>×</button>
        </div>
        <PasswordField label="Current Password" value={current} onChange={setCurrent} inputSt={inputSt} brandColor={brandColor} />
        <PasswordField label="New Password" value={next} onChange={setNext} inputSt={inputSt} brandColor={brandColor} />
        <PasswordField label="Confirm Password" value={confirm} onChange={setConfirm} inputSt={inputSt} brandColor={brandColor} />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-4 py-2 rounded-xl text-sm border font-semibold disabled:opacity-50"
            style={{ borderColor: borderCol, color: brandColor }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: brandColor }}>
            {saving ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

export default function SettingsPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { refreshProfile, setProfile: setAdminProfile } = useAdminProfile();
  const { session } = usePermissions();
  const isDark = theme === "dark";
  const canChangePassword = Boolean(session?.isSuperAdmin || session?.canChangePassword);

  const brandColor  = "#591727";
  const borderCol   = "#8e8787";
  const cardBg      = isDark ? "#c9a898" : "#ffffff";
  const cardInnerBg = isDark ? "#d0baa3" : "#f7f4ef";
  const inputBg     = isDark ? "#d0baa3"  : "#f5f2ec";
  const text1       = brandColor;
  const text2       = isDark ? "#591727"  : "#7a6060";
  const labelColor  = isDark ? "#591727"  : "#9a7070";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [profTitle, setProfTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoVersion, setPhotoVersion] = useState(0);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [twoFactor, setTwoFactor] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [passwordChangedLabel, setPasswordChangedLabel] = useState("Never changed");
  const [showPwModal, setShowPwModal] = useState(false);

  const [alertSMS, setAlertSMS] = useState(true);
  const [alertReports, setAlertReports] = useState(true);
  const [alertMarketing, setAlertMarketing] = useState(false);
  const [alertsSaving, setAlertsSaving] = useState(false);

  const [clinicName, setClinicName] = useState("");
  const [clinicEmail, setClinicEmail] = useState("");
  const [primaryContact, setPrimaryContact] = useState("");
  const [address, setAddress] = useState("");
  const [clinicSaved, setClinicSaved] = useState(false);
  const [clinicSaving, setClinicSaving] = useState(false);

  const [hours, setHours] = useState<BusinessHourEntry[]>(DEFAULT_SETTINGS_OVERVIEW.clinic.businessHours);
  const [editingHour, setEditingHour] = useState<number | null>(null);
  const [hoursSaving, setHoursSaving] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);

  const applySettings = useCallback((data: SettingsOverview) => {
    setFullName(data.profile.fullName);
    setProfTitle(data.profile.professionalTitle);
    setEmail(data.profile.email);
    setPhone(data.profile.phone);
    setPhotoUrl(data.profile.profilePhoto);
    setTwoFactor(data.profile.twoFactorEnabled);
    setPasswordChangedLabel(data.profile.passwordChangedLabel);
    setAlertSMS(data.profile.alertPreferences.appointmentSms);
    setAlertReports(data.profile.alertPreferences.clinicReports);
    setAlertMarketing(data.profile.alertPreferences.marketingEmails);
    setClinicName(data.clinic.clinicName);
    setClinicEmail(data.clinic.clinicEmail);
    setPrimaryContact(data.clinic.primaryContact);
    setAddress(data.clinic.address);
    setHours(data.clinic.businessHours);
  }, []);

  const loadSettings = useCallback(async () => {
    setError("");
    try {
      const data = await fetchSettingsOverview();
      applySettings(data);
      setAdminProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, [applySettings, setAdminProfile]);

  useEffect(() => {
    const token = getToken();
    const admin = getAdmin();
    if (!token || !admin) {
      router.push("/login");
      return;
    }
    loadSettings();
  }, [loadSettings, router]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setError("");
    try {
      const updated = await updateSettingsProfile({
        fullName,
        professionalTitle: profTitle,
        email,
        phone,
      });
      applySettings({
        profile: updated,
        clinic: { clinicName, clinicEmail, primaryContact, address, businessHours: hours },
      });
      setAdminProfile(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);

      const token = getToken();
      const admin = getAdmin();
      if (token && admin) {
        const parts = fullName.trim().split(/\s+/);
        setAuth(token, {
          ...admin,
          email: updated.email,
          firstName: parts[0] || admin.firstName,
          lastName: parts.slice(1).join(" ") || admin.lastName,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setError("");
    try {
      const result = await uploadSettingsProfilePhoto(file);
      setPhotoUrl(result.profilePhoto);
      setPhotoVersion(Date.now());
      const latest = await refreshProfile();
      if (latest) applySettings({
        profile: latest,
        clinic: { clinicName, clinicEmail, primaryContact, address, businessHours: hours },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
      if (photoRef.current) photoRef.current.value = "";
    }
  };

  const handlePhotoRemove = async () => {
    setPhotoUploading(true);
    setError("");
    try {
      await removeSettingsProfilePhoto();
      setPhotoUrl("");
      setPhotoVersion(Date.now());
      const latest = await refreshProfile();
      if (latest) applySettings({
        profile: latest,
        clinic: { clinicName, clinicEmail, primaryContact, address, businessHours: hours },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleClinicSave = async () => {
    setClinicSaving(true);
    setError("");
    try {
      await updateSettingsClinic({ clinicName, clinicEmail, primaryContact, address });
      setClinicSaved(true);
      setTimeout(() => setClinicSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save clinic preferences.");
    } finally {
      setClinicSaving(false);
    }
  };

  const persistAlerts = async (next: AlertPreferences) => {
    setAlertsSaving(true);
    setError("");
    try {
      await updateSettingsAlerts(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update alert preferences.");
      await loadSettings();
    } finally {
      setAlertsSaving(false);
    }
  };

  const handleTwoFactorChange = async (enabled: boolean) => {
    const previous = twoFactor;
    setTwoFactor(enabled);
    setSecuritySaving(true);
    setError("");
    try {
      await updateSettingsSecurity(enabled);
    } catch (err) {
      setTwoFactor(previous);
      setError(err instanceof Error ? err.message : "Failed to update security settings.");
    } finally {
      setSecuritySaving(false);
    }
  };

  const handlePasswordChange = async (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const result = await changeSettingsPassword(payload);
    setPasswordChangedLabel(result.passwordChangedLabel);
  };

  const updateHour = async (idx: number, entry: BusinessHourEntry) => {
    const nextHours = hours.map((h, i) => (i === idx ? entry : h));
    setHours(nextHours);
    setHoursSaving(true);
    setError("");
    try {
      const saved = await updateSettingsBusinessHours(nextHours);
      setHours(saved);
      setEditingHour(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save business hours.");
      await loadSettings();
    } finally {
      setHoursSaving(false);
    }
  };

  const card: React.CSSProperties = {
    backgroundColor: cardBg,
    borderRadius: 16,
    border: `1px solid ${isDark ? "#753141" : "#591727"}`,
    padding: "28px 28px",
    marginBottom: 20,
  };
  const inputSt: React.CSSProperties = {
    backgroundColor: inputBg,
    borderColor: isDark ? borderCol : "#8e8787",
    color: text1,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 12,
    padding: "11px 16px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };
  const lbl = "text-[10px] font-bold tracking-widest uppercase mb-2 block";
  const lblSt: React.CSSProperties = { color: labelColor };

  if (loading) {
    return (
      <div className="min-h-full ml-10 max-sm:ml-0 max-sm:px-3 flex items-center justify-center" style={{ marginTop: 40 }}>
        <p className="text-sm italic" style={{ color: text2 }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full ml-10 max-sm:ml-0 max-sm:px-3 transition-colors duration-300" style={{ marginTop: 40, background: "transparent" }}>

      {showPwModal && (
        <ChangePasswordModal
          onClose={() => setShowPwModal(false)}
          onSubmit={handlePasswordChange}
          isDark={isDark} brandColor={brandColor} borderCol={borderCol}
        />
      )}
      {editingHour !== null && (
        <HoursModal
          entry={hours[editingHour]}
          onSave={e => updateHour(editingHour, e)}
          onClose={() => setEditingHour(null)}
          isDark={isDark} brandColor={brandColor} borderCol={borderCol}
          saving={hoursSaving}
        />
      )}

      <h1
        className="mb-6"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 28, fontWeight: 700,
          color: isDark ? "#FFFFFF" : "#591727",
          letterSpacing: "0.03em",
        }}
      >
        Settings
      </h1>

      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm border border-red-300 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-5 items-start max-sm:flex-col">
        <div style={{ flex: "1 1 0", minWidth: 0 }}>

          <div style={card}>
            <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold mb-1" style={{ color: text1, fontFamily: "'Cormorant Garamond', serif" }}>
                  Profile Management
                </h2>
                <p className="text-sm" style={{ color: text2 }}>
                  Update your professional identity and contact details.
                </p>
              </div>
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0 disabled:opacity-60"
                style={{ backgroundColor: brandColor, minWidth: 90 }}
              >
                {profileSaving ? "Saving..." : profileSaved ? "Saved ✓" : "Save"}
              </button>
            </div>

            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-4">
              <div>
                <span className={lbl} style={lblSt}>Full Name</span>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Dr. Ghita Ouazzani Tnacheri" style={inputSt} />
              </div>
              <div>
                <span className={lbl} style={lblSt}>Professional Title</span>
                <input value={profTitle} onChange={e => setProfTitle(e.target.value)}
                  placeholder="General Dentist" style={inputSt} />
              </div>
              <div>
                <span className={lbl} style={lblSt}>Email Address</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="contact@atlasdentalcenter.com" style={inputSt} />
              </div>
              <div>
                <span className={lbl} style={lblSt}>Phone Number</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456" style={inputSt} />
              </div>
            </div>

            <div style={{ height: 1, background: isDark ? "rgba(89,23,39,0.2)" : "#591727", margin: "20px 0" }} />

            <div className="flex items-center gap-5">
              <div
                className="w-24 h-24 rounded-xl overflow-hidden shrink-0"
                style={{ backgroundColor: isDark ? "#b09a8a" : "#e8ddd4", border: `1px solid ${isDark ? borderCol : "#8e8787"}` }}
              >
                {photoUrl ? (
                  <img
                    src={`${photoUrl}${photoUrl.includes("?") ? "&" : "?"}v=${photoVersion}`}
                    alt="Profile"
                    className="w-full h-full object-cover object-center"
                    onError={() => setPhotoUrl("")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                    style={{ color: brandColor, opacity: 0.5 }}>
                    {(fullName || email || "A").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: text1 }}>Profile Photo</p>
                <p className="text-xs mb-2" style={{ color: text2 }}>Upload or remove your profile photo below.</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    disabled={photoUploading}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors hover:opacity-80 disabled:opacity-50"
                    style={{ borderColor: isDark ? borderCol : "#8e8787", color: text1, backgroundColor: "transparent" }}
                  >
                    {photoUploading ? "Uploading..." : "Upload New"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePhotoRemove}
                    disabled={photoUploading || !photoUrl}
                    className="text-sm transition-opacity hover:opacity-60 disabled:opacity-40"
                    style={{ color: text2 }}
                  >
                    Remove
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
              <h2 className="text-xl font-semibold" style={{ color: text1, fontFamily: "'Cormorant Garamond', serif" }}>
                Clinic Preferences
              </h2>
              <button
                onClick={handleClinicSave}
                disabled={clinicSaving}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0 disabled:opacity-60"
                style={{ backgroundColor: brandColor }}
              >
                {clinicSaving ? "Saving..." : clinicSaved ? "Saved ✓" : "Save"}
              </button>
            </div>

            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-4">
              <div>
                <span className={lbl} style={lblSt}>Clinic Name</span>
                <input value={clinicName} onChange={e => setClinicName(e.target.value)}
                  placeholder="Atlas Dental Center" style={inputSt} />
              </div>
              <div>
                <span className={lbl} style={lblSt}>Clinic Email</span>
                <input type="email" value={clinicEmail} onChange={e => setClinicEmail(e.target.value)}
                  placeholder="contact@atlasdentalcenter.com" style={inputSt} />
              </div>
              <div>
                <span className={lbl} style={lblSt}>Primary Contact</span>
                <input value={primaryContact} onChange={e => setPrimaryContact(e.target.value)}
                  placeholder="05 37 77 77 79" style={inputSt} />
              </div>
            </div>

            <div>
              <span className={lbl} style={lblSt}>Address</span>
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Ang Av Atlas, 61 rue Oued Oum Errabi..."
                style={{ ...inputSt, width: "100%" }} />
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto" style={{ width: undefined, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}>
          <style>{`@media (min-width: 640px) { .settings-right-col { width: 320px !important; } }`}</style>
          <div className="settings-right-col flex flex-col gap-5 w-full">

            <div style={card}>
              <div className="flex items-center gap-2 mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <h3 className="text-base font-bold" style={{ color: text1 }}>Security</h3>
              </div>

              {canChangePassword ? (
                <button
                  onClick={() => setShowPwModal(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl mb-3 transition-colors hover:opacity-80 text-left"
                  style={{ backgroundColor: cardInnerBg, border: `1px solid ${isDark ? borderCol : "#630808"}` }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: text1 }}>Change Password</p>
                    <p className="text-[11px] mt-0.5" style={{ color: text2 }}>{passwordChangedLabel}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              ) : (
                <div
                  className="w-full p-3.5 rounded-xl mb-3 text-left"
                  style={{ backgroundColor: cardInnerBg, border: `1px solid ${isDark ? borderCol : "#630808"}` }}
                >
                  <p className="text-sm font-semibold" style={{ color: text1 }}>Password Managed by Super Admin</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: text2 }}>
                    Use the login page to request a password reset from the Super Admin.
                  </p>
                </div>
              )}

              <div
                className="flex items-center justify-between p-3.5 rounded-xl"
                style={{ backgroundColor: cardInnerBg, border: `1px solid ${isDark ? borderCol : "#630808"}` }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: text1 }}>Two-Factor Auth</p>
                  <p className="text-[11px] font-bold mt-0.5" style={{ color: twoFactor ? "#d14747" : "#541515" }}>
                    {securitySaving ? "SAVING..." : twoFactor ? "ENABLED" : "DISABLED"}
                  </p>
                </div>
                <ToggleBlue checked={twoFactor} onChange={handleTwoFactorChange} disabled={securitySaving} />
              </div>
            </div>

            <div style={{
              backgroundColor: brandColor,
              borderRadius: 16,
              padding: "24px 24px",
              border: `1px solid ${brandColor}`,
            }}>
              <h3 className="text-base font-bold mb-5" style={{ color: "#f0e6d3" }}>
                Alert Preferences{alertsSaving ? " · Saving..." : ""}
              </h3>

              {[
                { label: "Appointment SMS", val: alertSMS, key: "appointmentSms" as const },
                { label: "Clinic Reports", val: alertReports, key: "clinicReports" as const },
                { label: "Marketing Emails", val: alertMarketing, key: "marketingEmails" as const },
              ].map((item, i, arr) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm" style={{ color: "#f0e6d3" }}>{item.label}</span>
                    <Toggle
                      checked={item.val}
                      disabled={alertsSaving}
                      onChange={(next) => {
                        const updated = {
                          appointmentSms: item.key === "appointmentSms" ? next : alertSMS,
                          clinicReports: item.key === "clinicReports" ? next : alertReports,
                          marketingEmails: item.key === "marketingEmails" ? next : alertMarketing,
                        };
                        if (item.key === "appointmentSms") setAlertSMS(next);
                        if (item.key === "clinicReports") setAlertReports(next);
                        if (item.key === "marketingEmails") setAlertMarketing(next);
                        persistAlerts(updated);
                      }}
                      color="#bf1515"
                    />
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ height: 1, background: "rgba(240,230,211,0.15)" }} />
                  )}
                </div>
              ))}
            </div>

            <div style={card}>
              <div className="flex items-center gap-2 mb-5">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={brandColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <h3 className="text-base font-bold" style={{ color: text1 }}>Business Hours</h3>
              </div>

              <div className="flex flex-col gap-1">
                {hours.map((h, i) => (
                  <div key={h.label}
                    className="flex items-center justify-between py-2.5 rounded-lg px-1"
                    style={{ borderBottom: i < hours.length - 1 ? `1px solid ${isDark ? "rgba(89,23,39,0.2)" : "#ece4da"}` : "none" }}
                  >
                    <span className="text-sm font-medium" style={{ color: h.closed ? text2 : text1 }}>{h.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: h.closed ? text2 : text1 }}>
                        {h.closed ? "Closed" : `${h.start} – ${h.end}`}
                      </span>
                      <button
                        onClick={() => setEditingHour(i)}
                        disabled={hoursSaving}
                        className="w-6 h-6 flex items-center justify-center rounded transition-colors hover:opacity-70 disabled:opacity-40"
                        style={{ color: text2 }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
