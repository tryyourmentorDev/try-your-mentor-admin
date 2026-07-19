"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

// India-based product: pin the calendar grid to IST so events render at their
// IST wall-clock time regardless of the admin's machine timezone.
moment.tz.setDefault("Asia/Kolkata");

const localizer = momentLocalizer(moment);

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

interface BigCalendarProps {
  events: CalendarEvent[];
  onSelectEvent: (event: any) => void;
  onSelectSlot: (slotInfo: any) => void;
}

const BigCalendar = ({ events, onSelectEvent, onSelectSlot }: BigCalendarProps) => {
  const [view, setView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    onSelectEvent(event);
  };

  const handleSelectSlot = (slotInfo: any) => {
    setSelectedEvent(null);
    setCurrentDate(slotInfo.start);
    setView(Views.DAY);
    onSelectSlot(slotInfo);
  };

  const handleNavigate = (newDate: Date, newView: View) => {
    setCurrentDate(newDate);
    setView(newView);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
  };

  const goToNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "month").toDate());
  };

  return (
    <div style={{ height: "100vh" }}>
      {view === Views.MONTH && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <button
            onClick={goToPreviousMonth}
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Previous Month
          </button>
          <button
            onClick={goToNextMonth}
            style={{ padding: "5px 10px", cursor: "pointer" }}
          >
            Next Month
          </button>
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month", "day"]}
        view={view}
        date={currentDate}
        onView={handleOnChangeView}
        onNavigate={handleNavigate}
        min={new Date(2025, 1, 0, 8, 0, 0)}
        max={new Date(2025, 1, 0, 17, 0, 0)}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        defaultDate={new Date()}
      />
    </div>
  );
};

export default BigCalendar;
