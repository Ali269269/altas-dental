export function patientStatusStyle(status: string) {
  switch (status) {
    case "ACTIVE":
      return"text-[#711c31] border border-[#C94A3A] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide";
    case "PENDING":
      return "text-[#753141] border border-[#D3D3D3] bg-[#d3d3d3] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "COMPLETED":
      return "text-[#ffffff] border border-[#591727] bg-[#753141] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "CANCELLED":
      return "text-[#C94A3A] border border-[#C94A3A] bg-[#FEE2E2] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "CONFIRMED":
      return "text-[#591727] border border-[#591727] bg-[#99757e] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "FOLLOW-UP REQUIRED":
      return "text-[#C9922A] border border-[#C9922A] bg-[#FEF3C7] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    default:
      return "";
  }
}
