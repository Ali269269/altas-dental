"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ProfileDetailsModalProps = {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  photoUrl: string;
  onClose: () => void;
  isDark: boolean;
};

export default function ProfileDetailsModal({
  fullName,
  professionalTitle,
  email,
  phone,
  photoUrl,
  onClose,
  isDark,
}: ProfileDetailsModalProps) {
  const brandColor = "#591727";
  const borderCol = "#8e8787";
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const rows = [
    { label: "Full Name", value: fullName || "—" },
    { label: "Professional Title", value: professionalTitle || "—" },
    { label: "Email", value: email || "—" },
    { label: "Phone", value: phone || "—" },
  ];

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: isDark ? "#c9a898" : "#ffffff",
          border: `1px solid ${borderCol}`,
        }}
      >
        <div className="flex items-start justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: brandColor }}>
            Profile Details
          </h3>
          <button type="button" onClick={onClose} className="text-lg font-bold" style={{ color: brandColor }}>
            ×
          </button>
        </div>

        <div className="flex flex-col items-center mb-5">
          <div
            className="w-32 h-32 rounded-2xl overflow-hidden mb-3"
            style={{
              backgroundColor: isDark ? "#b09a8a" : "#e8ddd4",
              border: `1px solid ${borderCol}`,
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName || "Profile"}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{ color: brandColor, opacity: 0.5 }}
              >
                {(fullName || email || "A").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="text-lg font-semibold text-center" style={{ color: brandColor }}>
            {fullName || "Admin"}
          </p>
          {professionalTitle ? (
            <p className="text-sm text-center mt-1" style={{ color: brandColor, opacity: 0.8 }}>
              {professionalTitle}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-xl px-4 py-3"
              style={{
                backgroundColor: isDark ? "#d0baa3" : "#f7f4ef",
                border: `1px solid ${borderCol}`,
              }}
            >
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: brandColor }}>
                {row.label}
              </p>
              <p className="text-sm break-words" style={{ color: brandColor }}>
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
