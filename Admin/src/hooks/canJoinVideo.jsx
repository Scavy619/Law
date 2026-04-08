// hook for handling joining situation of video call

// slotStart - 15min → countdown
// slotStart - 15min → slotEnd + 10min → join
// after slotEnd + 10min → expired

import { useEffect, useState } from "react";

const getAppointmentDateTime = (appointment) => {
  const [day, month, year] = appointment.slotDate.split("_");
  return new Date(`${year}-${month}-${day} ${appointment.slotTime}`);
};

const getJoinState = (appointment, now) => {
  const slotStart = getAppointmentDateTime(appointment);

  const joinStart = new Date(slotStart.getTime() - 15 * 60 * 1000);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
  const expiry = new Date(slotEnd.getTime() + 10 * 60 * 1000);

  if (now < joinStart) {
    const diff = Math.floor((joinStart - now) / 1000);
    return { state: "too_early", countdown: diff };
  }

  if (now > expiry) {
    return { state: "expired", countdown: 0 };
  }

  return { state: "join", countdown: 0 };
};

export const useJoinStatus = (appointment) => {
  const [status, setStatus] = useState({
    state: "too_early",
    countdown: 0,
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const result = getJoinState(appointment, now);
      setStatus(result);
    };

    update();

    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [appointment]);

  return status;
};
