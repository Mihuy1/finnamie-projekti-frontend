import { useEffect, useRef, useState } from "react";
import {
  getActivities,
  getExperienceByHostId,
  getProfile,
  getSuggestionActivitiesByHostId,
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
          // getSuggestionActivitiesByHostId(),
        ]);

        if (!data) throw new Error("No data received");

        hasFetchedProfile.current = user.id;

        let activitiesSuggestionData;

        if (data.role === "host") {
          setIsHost(true);

          try {
            const [hostTimeslots, suggestions] = await Promise.all([
              // getTimeSlotsByHostId(user.id),
              getExperienceByHostId(),
              getSuggestionActivitiesByHostId(),
            ]);

            console.log("hostTimeslots", hostTimeslots);

            setTimeSlots(hostTimeslots || []);
            activitiesSuggestionData = Array.isArray(suggestions)
              ? suggestions
              : [];
          } catch (hostError) {
            console.error("Error fetching host specific data:", hostError);
          }
        }

        const initialData = {
          ...data,
          date_of_birth: formatDateForInput(data.date_of_birth),
          host_activities: data.host_activities || [],
          activities_suggestions: activitiesSuggestionData,
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
