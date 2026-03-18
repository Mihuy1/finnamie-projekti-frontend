import { useEffect, useRef, useState } from "react";
import {
  getActivities,
  getProfile,
  getTimeSlotsByHostId,
} from "../api/apiClient";
import { formatDateForInput } from "../utils/date-utils";

export const useUserProfile = (user, loading) => {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [activitiesForm, setActivitiesForm] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const hasFetchedProfile = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (loading || !user) return;

      if (hasFetchedProfile.current === user.id) return;

      try {
        const profilePromise = getProfile();

        const [data, activitiesData] = await Promise.all([
          profilePromise,
          getActivities(),
        ]);

        if (!data) throw new Error("No data recieved");

        hasFetchedProfile.current = user.id;

        if (data.role === "host") {
          setIsHost(true);
          const hostTimeslots = await getTimeSlotsByHostId(user.id);
          setTimeSlots(hostTimeslots || []);
        }

        const initialData = {
          ...data,
          date_of_birth: formatDateForInput(data.date_of_birth),
          host_activities: data.host_activites || [],
        };

        setActivitiesForm(activitiesData);
        setProfile(initialData);
        setProfileForm(initialData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        hasFetchedProfile.current = null;
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchData();
  }, [user, loading]);

  return {
    profile,
    setProfile,
    profileForm,
    setProfileForm,
    isHost,
    setIsHost,
    activitiesForm,
    setActivitiesForm,
    timeSlots,
    setTimeSlots,
    isProfileLoading,
  };
};
