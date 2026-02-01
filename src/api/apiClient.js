const BASE_URL = "http://localhost:3000/api/";

export const getAllTimeSlots = async () => {
  try {
    const res = await fetch(`${BASE_URL}timeslots`);
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};
