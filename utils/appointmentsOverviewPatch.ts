import type {
  AppointmentsPageOverview,
  AppointmentListItem,
  AppointmentTableRow,
} from "@/utils/appointmentsData";

type OverviewLists = Pick<
  AppointmentsPageOverview,
  "statCards" | "upcomingAppointments" | "patientsSeen" | "allAppointments"
>;

/** Apply server-refreshed carousel + stat sections after checkup or status change. */
export function mergeOverviewLists(
  prev: AppointmentsPageOverview,
  overview: Partial<OverviewLists> & {
    dayCalendar?: AppointmentsPageOverview["dayCalendar"];
  }
): AppointmentsPageOverview {
  return {
    ...prev,
    statCards: overview.statCards ?? prev.statCards,
    upcomingAppointments:
      overview.upcomingAppointments ?? prev.upcomingAppointments,
    patientsSeen: overview.patientsSeen ?? prev.patientsSeen,
    allAppointments: overview.allAppointments ?? prev.allAppointments,
    dayCalendar: overview.dayCalendar ?? prev.dayCalendar,
  };
}

/** Optimistically move one appointment from upcoming → seen (no full refetch). */
export function applyAppointmentSeenLocally(
  prev: AppointmentsPageOverview,
  appointmentId: string,
  seenItem: AppointmentListItem
): AppointmentsPageOverview {
  const upcomingAppointments = prev.upcomingAppointments.filter(
    (a) => a.id !== appointmentId
  );
  const patientsSeen = [
    seenItem,
    ...prev.patientsSeen.filter((a) => a.id !== appointmentId),
  ];

  const statCards = prev.statCards.map((card) => {
    if (card.label.includes("Patients seen")) {
      const n = parseInt(card.value, 10) || 0;
      return { ...card, value: String(n + 1) };
    }
    if (card.label.includes("Patients left")) {
      const n = parseInt(card.value, 10) || 0;
      return { ...card, value: String(Math.max(0, n - 1)) };
    }
    return card;
  });

  const allAppointments = prev.allAppointments.map((row) =>
    row.id === appointmentId
      ? { ...row, status: "SEEN", rawStatus: "SEEN" }
      : row
  );

  return {
    ...prev,
    statCards,
    upcomingAppointments,
    patientsSeen,
    allAppointments,
  };
}

export function applyTableRowUpdate(
  prev: AppointmentsPageOverview,
  row: AppointmentTableRow
): AppointmentsPageOverview {
  return {
    ...prev,
    allAppointments: prev.allAppointments.map((r) =>
      r.id === row.id ? row : r
    ),
  };
}
