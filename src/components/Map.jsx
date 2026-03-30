// @ts-nocheck
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { getAllExperiencesWithHost, getAllTimeSlots } from "../api/apiClient";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function Map({ activityType }) {
  const [timeslots, setTimeslots] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const slots = await getAllExperiencesWithHost();
        if (slots) {
          console.log("slots:", slots);
          setTimeslots(slots);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }, []);

  const filteredSlots = !activityType
    ? timeslots
    : timeslots.filter((slot) => {
      return slot.type === activityType;
    });

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer center={[65.4, 26]} zoom={5} scrollWheelZoom={false}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredSlots.length > 0 &&
          filteredSlots.map((slot) => {
            const lat = parseFloat(slot.latitude_deg);
            const lng = parseFloat(slot.longitude_deg);

            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`Slot ID ${slot.id} puuttuvat koordinaatit.`, slot);
              return null;
            }

            const position = [slot.latitude_deg, slot.longitude_deg];
            const start = new Date(slot.rule.start_date).toLocaleString(
              "en-GB",
            );
            const end = new Date(slot.rule.end_date).toLocaleString("en-GB");
            return (
              <Marker position={position} key={slot.id}>
                <Popup>
                  <p>City: {slot.city}</p>
                  <p>Start: {slot.rule.start_time}</p>
                  <p>End: {slot.rule.end_time}</p>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}

export default Map;
