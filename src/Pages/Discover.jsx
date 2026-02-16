import { useEffect, useState } from "react";
import { getAllTimeSlots } from "../api/apiClient";
import { TimeSlot } from "../components/Timeslot";

function Discover() {
  const [timeslots, setTimeSlots] = useState([]);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const slots = await getAllTimeSlots();

        console.log("Slots:", slots);

        if (slots) setTimeSlots(slots);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTimeSlots();
  }, []);

  return (
    <div className="discover-container">
      <h1 className="discover-title">Discover Experiences</h1>
      <div className="timeslots-grid">
        {timeslots.map((slot) => (
          <TimeSlot
            key={slot.id}
            id={slot.id}
            host_id={slot.host_id}
            type={slot.type}
            start_time={slot.start_time}
            end_time={slot.end_time}
            res_status={slot.res_status}
            description={slot.description}
            city={slot.city}
            latitude_deg={slot.latitude_deg}
            longitude_deg={slot.longitude_deg}
            activity_type={slot.activity_type}
          />
        ))}
      </div>
    </div>
  );
}

export default Discover;
