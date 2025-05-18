"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { uk } from "date-fns/locale";

const locales = { uk };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface Event {
  title: string;
  start: Date;
  end: Date;
}

const events: Event[] = [
  {
    title: "Grammar lesson",
    start: new Date(2025, 2, 22, 10, 0),
    end: new Date(2025, 2, 22, 11, 0),
  },
  {
    title: "Group class",
    start: new Date(2025, 2, 23, 14, 0),
    end: new Date(2025, 2, 23, 15, 0),
  },
];

export default function BigCalendar() {
  const setSelectedDate = (date: Date | null) => {
    console.log("Selected date:", date);
  };

  return (
    <div className="h-[700px] w-full bg-white p-4 rounded-md border">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={(slotInfo) => setSelectedDate(slotInfo.start)}
        style={{ height: "100%" }}
      />
    </div>
  );
}
