"use client";

import { useState } from "react";

export function NewNoteModal({
  onClose, onSave, isDark,
}: { onClose: () => void; onSave: (note: string, status: string) => void; isDark: boolean }) {
  const [noteText, setNoteText]     = useState("");
  const [noteStatus, setNoteStatus] = useState("Completed");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#681A2D]">New Notes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="border-l-4 border-[#681A2D] mb-5">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Type..."
            rows={5}
            className="w-full px-4 py-3 text-sm outline-none resize-none bg-[#F8F7F5] text-[#681A2D] placeholder-gray-400"
          />
        </div>
        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#681A2D] mb-2">TREATMENT STATUS</p>
          <select
            value={noteStatus}
            onChange={e => setNoteStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#FFFFFF] text-sm text-[#3D0A1F] bg-white outline-none appearance-none"
          >
            <option>Completed</option>
            <option>Follow-up Required</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => { onSave(noteText, noteStatus); onClose(); }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#591727]"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold border border-[#D9C9A8] text-[#3D0A1F]"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}
