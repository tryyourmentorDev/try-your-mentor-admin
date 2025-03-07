"use client";
import React, { useState, useEffect } from "react";
import BigCalendar from "@/components/BigCalender";
import { mentorData, calendarEvents } from "@/lib/data";

const SessionManagerPage = () => {
  const [mentor, setMentor] = useState("");
  const [mentee, setMentee] = useState("");
  const [sessionDateTime, setSessionDateTime] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    setIsFormValid(mentor !== "" && mentee !== "" && sessionDateTime !== "");
  }, [mentor, mentee, sessionDateTime]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (formMode === "create") {
      const newEvent = {
        id: calendarEvents.length + 1,
        title: `${mentee}_${mentor}_Session`,
        allDay: false,
        start: new Date(sessionDateTime),
        end: new Date(new Date(sessionDateTime).getTime() + 60 * 60 * 1000),
      };
      calendarEvents.push(newEvent);
      alert("Session created successfully!");
    } else if (formMode === "update" && selectedEvent) {
      const eventIndex = calendarEvents.findIndex(
        (event) => event.id === selectedEvent.id
      );
      if (eventIndex > -1) {
        calendarEvents[eventIndex] = {
          ...calendarEvents[eventIndex],
          title: `${mentee}_${mentor}_Session`,
          start: new Date(sessionDateTime),
          end: new Date(new Date(sessionDateTime).getTime() + 60 * 60 * 1000),
        };
        alert("Session updated successfully!");
      }
    }
    resetForm();
  };

  const resetForm = () => {
    setMentor("");
    setMentee("");
    setSessionDateTime("");
    setFormMode("create");
    setSelectedEvent(null);
  };

  const handleSelectEvent = (event: any) => {
    if (event && event.title) {
      setSelectedEvent(event);
      setMentor(event.title.split("_")[1]);
      setMentee(event.title.split("_")[0]);
      setSessionDateTime(new Date(event.start).toISOString().slice(0, 16));
      setFormMode("update");
    }
  };

  const handleSelectSlot = (slotInfo: any) => {
    resetForm();
  };

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalendar
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <h2 className="text-xl font-semibold">
          {formMode === "create" ? "Create Session" : "Update Session"}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="mentor"
              className="block text-sm font-medium text-gray-700"
            >
              Mentor Name
            </label>
            <select
              id="mentor"
              name="mentor"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={mentor}
              onChange={(e) => setMentor(e.target.value)}
            >
              <option value="">Select a mentor</option>
              {mentorData.map((mentor) => (
                <option key={mentor.id} value={mentor.name}>
                  {mentor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="mentee"
              className="block text-sm font-medium text-gray-700"
            >
              Mentee Name
            </label>
            <input
              type="text"
              id="mentee"
              name="mentee"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={mentee}
              onChange={(e) => setMentee(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="sessionDateTime"
              className="block text-sm font-medium text-gray-700"
            >
              Session Date and Time
            </label>
            <input
              type="datetime-local"
              id="sessionDateTime"
              name="sessionDateTime"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={sessionDateTime}
              onChange={(e) => setSessionDateTime(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={!isFormValid}
          >
            {formMode === "create" ? "Create Session" : "Update Session"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SessionManagerPage;
