// @ts-nocheck

const BASE_URL = "http://localhost:3000/api/";
const GEOAPIFY_KEY = "b37952a659224430b7545612f420ab9c";

export const getAllExperiencesWithHost = async () => {
  try {
    const res = await fetch(`${BASE_URL}experiences/withHost`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  } catch (error) {
    console.error("error fetching all experiences with host:", error);
  }
};

export const getExperienceByHostId = async () => {
  try {
    const res = await fetch(`${BASE_URL}experiences/host`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  } catch (error) {
    console.error("error getExperienceByHostId:", error);
    throw error;
  }
};

export const createExperience = async (data, images) => {
  const formData = new FormData();

  for (const key in data) {
    const value = data[key];

    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  if (images) {
    for (const file of images) {
      formData.append("images", file);
    }
  }

  try {
    const res = await fetch(`${BASE_URL}experiences/host`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create experience");
    }

    return await res.json();
  } catch (error) {
    console.error("Create Experience error:", error);
    throw error;
  }
};

export const deleteExperienceById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}experiences/host/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || "Something went wrong during experience deletion";
      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (error) {
    console.error("delete experience:", error);
    throw error;
  }
};

export const getAllTimeSlots = async () => {
  try {
    const res = await fetch(`${BASE_URL}timeslots/available`, {
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const getTimeslotByIdWithExperience = async (timeslot_id) => {
  try {
    const res = await fetch(
      `${BASE_URL}timeslots/timeslotWithExperience/${timeslot_id}`,
      {
        credentials: "include",
      },
    );

    console.log("res:", res);

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message ||
            "Something went wrong while fetching timeslotByIdWithExperience";

      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getTimeslotsByRuleId = async (ruleId) => {
  try {
    const res = await fetch(`${BASE_URL}timeslots/rule/${ruleId}`, {
      credentials: "include",
    });

    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const createTimeslot = async (timeslot) => {
  if (!timeslot) return;

  try {
    const res = await fetch(`${BASE_URL}timeslots`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(timeslot),
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const deleteTimeslot = async (timeslotId) => {
  try {
    const res = await fetch(`${BASE_URL}timeslots/${timeslotId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getTimeslotById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}timeslots/${id}`, {
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const getAllTimeSlotsWithHost = async () => {
  try {
    const res = await fetch(`${BASE_URL}timeslots/availableWithHost`, {
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

export const getTimeSlotsByHostId = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}timeslots/host/${id}`, {
      method: "GET",
      credentials: "include",
    });

    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

export const getTimeSlotImage = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}media/upload/timeslots/${id}`, {
      credentials: "include",
    });

    return await res.json();
  } catch (error) {
    console.error("Error fetching image for timeslot:", error);
  }
};

export const deleteTimeSlotImageByIdAndUrl = async (timeslot_id, image_url) => {
  try {
    const res = await fetch(
      `${BASE_URL}media/upload/timeslots/${timeslot_id}`,
      {
        method: "DELETE",
        credentials: "include",
        body: JSON.stringify({ image_url: image_url }),
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res.ok) {
      const ct = res.headers.get("content-type") ?? "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : await res.text();
      const message =
        typeof payload === "string"
          ? payload
          : payload?.error ?? payload?.message;

      throw new Error(message || "Failed to delete image.");
    }

    return true;
  } catch (error) {
    console.error("Error deleting image for timeslot:", error);
  }
};

export const deleteExperienceImageByIdAndUrl = async (
  experience_id,
  image_url,
) => {
  try {
    const res = await fetch(
      `${BASE_URL}media/upload/experiences/${experience_id}`,
      {
        method: "DELETE",
        credentials: "include",
        body: JSON.stringify({ image_url: image_url }),
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res.ok) {
      const ct = res.headers.get("content-type") ?? "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : await res.text();
      const message =
        typeof payload === "string"
          ? payload
          : payload?.error ?? payload?.message;

      throw new Error(message || "Failed to delete image.");
    }

    return true;
  } catch (error) {
    console.error("Error deleting image for timeslot:", error);
  }
};

export const deleteTimeSlotImage = async (timeslot_id) => {
  try {
    const res = await fetch(
      `${BASE_URL}media/upload/timeslots/${timeslot_id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    if (!res.ok) {
      const ct = res.headers.get("content-type") ?? "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : await res.text();
      const message =
        typeof payload === "string"
          ? payload
          : payload?.error ?? payload?.message;

      throw new Error(message || "Failed to delete image.");
    }
  } catch (error) {
    console.error("Error deleting image for timeslot:", error);
  }
};

export const uploadTimeSlotImage = async (timeslot_id, files) => {
  console.log("file:", files);
  const formData = new FormData();

  for (const file of files) {
    formData.append("images", file);
  }

  let res;

  try {
    res = await fetch(`${BASE_URL}media/upload/timeslots/${timeslot_id}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const ct = res.headers.get("content-type") ?? "";
    const payload = ct.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      const message =
        typeof payload === "string"
          ? payload
          : payload?.error ?? payload?.message;

      throw new Error(message || "Upload failed");
    }

    return payload;
  } catch (error) {
    console.error("Error uploading image for timeslot:", error);
    throw new Error("Network error. Please try again.");
  }
};
export const uploadExperienceImage = async (experience_id, files) => {
  console.log("file:", files);
  const formData = new FormData();

  for (const file of files) {
    formData.append("images", file);
  }

  let res;

  try {
    res = await fetch(`${BASE_URL}media/upload/experiences/${experience_id}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const ct = res.headers.get("content-type") ?? "";
    const payload = ct.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      const message =
        typeof payload === "string"
          ? payload
          : payload?.error ?? payload?.message;

      throw new Error(message || "Upload failed");
    }

    return payload;
  } catch (error) {
    console.error("Error uploading image for timeslot:", error);
    throw new Error("Network error. Please try again.");
  }
};

export const updateExperience = async (id, data, images) => {
  const formData = new FormData();

  for (const key in data) {
    const value = data[key];

    if (Array.isArray(value) || typeof value === "object")
      formData.append(key, JSON.stringify(value));
    else formData.append(key, String(value));
  }

  if (images) {
    for (const image of images) {
      formData.append("images", image);
    }
  }

  try {
    const res = await fetch(`${BASE_URL}experiences/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || "Something went wrong while updating experience";

      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (error) {
    console.error("Update Experience error:", error);
    throw error;
  }
};

export const updateTimeSlot = async (id, data) => {
  try {
    const res = await fetch(`${BASE_URL}timeslots/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const ct = res.headers.get("content-type") ?? "";
    const payload = ct.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      const message =
        typeof payload === "string"
          ? payload
          : payload?.error ?? payload?.message;

      throw new Error(message || "Failed to update timeslot.");
    }

    return payload;
  } catch (error) {
    console.error("Error updating timeslot:", error);
  }
};

export const getConversations = async () => {
  try {
    const res = await fetch(`${BASE_URL}conversations`, {
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const getConversationId = async (receiverId) => {
  try {
    const res = await fetch(`${BASE_URL}conversations/conv-id/${receiverId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const getMessagesByConvId = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}conversations/${id}`, {
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const postLogin = async (email, password) => {
  const res = await fetch(`${BASE_URL}auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const ct = res.headers.get("content-type") ?? "";
  const payload = ct.includes("application/json")
    ? await res.json()
    : await res.text();
  if (!res.ok)
    throw new Error(
      typeof payload === "string"
        ? payload
        : payload?.error ?? payload?.message,
    );
  return payload;
};

export const logout = async () => {
  const res = await fetch(`${BASE_URL}auth/logout`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const ct = res.headers.get("content-type") ?? "";
    const payload = ct.includes("application/json")
      ? await res.json()
      : await res.text();
    const message =
      typeof payload === "string"
        ? payload
        : payload?.error ?? payload?.message;

    throw new Error(message || "Failed to log out.");
  }

  return true;
};

export const getPublicUserInfo = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}users/public/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

export const getAllUsers = async () => {
  try {
    const res = await fetch(`${BASE_URL}users/`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch users.");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || "Something went wrong while deleting user";

      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getActivities = async () => {
  try {
    const res = await fetch(`${BASE_URL}activities`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateActivityNameById = async (id, name) => {
  try {
    const res = await fetch(`${BASE_URL}activities/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || "Something went wrong while updating activity";

      throw Object.assign(new Error(message), { status: res.status });
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createActivity = async (name) => {
  try {
    const res = await fetch(`${BASE_URL}activities`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || "Something went wrong while creating activity";

      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteActivity = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}activities/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data.message || "Something went wrong while deleting activity";

      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSuggestionActivitiesByHostId = async () => {
  try {
    const res = await fetch(`${BASE_URL}activities/suggestions/host`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllActivitySuggestions = async () => {
  try {
    const res = await fetch(`${BASE_URL}activities/suggestions`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong");

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createActivitySuggestion = async (name) => {
  try {
    const res = await fetch(`${BASE_URL}activities/suggestions`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Something went wrong");

    return data;
  } catch (error) {
    console.error("error creating new activity suggestion:", error);
    throw error;
  }
};

export const acceptActivitySuggestion = async (id, name) => {
  try {
    const res = await fetch(`${BASE_URL}activities/suggestions/accept/${id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message ?? "Something went wrong while accepting suggestion";
      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const rejectActivitySuggestion = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}activities/suggestions/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message ?? "Something went wrong while rejecting suggestion";

      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const uploadUserImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  let res;

  try {
    res = await fetch(`${BASE_URL}media/upload/users`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
  } catch {
    throw new Error("Network error. Please try again.");
  }

  const ct = res.headers.get("content-type") ?? "";
  const payload = ct.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.error ?? payload?.message;

    throw new Error(message || "Upload failed");
  }

  return payload;
};

export const register = async (params) => {
  const {
    first_name,
    last_name,
    email,
    password,
    confirmPassword,
    role,
    country,
    date_of_birth,
    gender,
    phone_number,
    street_address,
    postal_code,
    city,
    description,
    experience_length,
    activity_ids,
  } = params;

  if (role !== "guest" && role !== "host") throw new Error("Invalid role.");

  const body = {
    first_name,
    last_name,
    email,
    password,
    confirmPassword,
    role,
    country,
    date_of_birth,
    gender,
    phone_number,
    street_address,
    postal_code,
    city,
    description,
    experience_length,
    activity_ids,
  };

  let res;

  try {
    res = await fetch(`${BASE_URL}auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Network error. Please try again.");
  }

  const data = await res.json();

  if (!res.ok) {
    const message =
      typeof data === "string" ? data : data?.message || "Registration failed.";

    throw Object.assign(new Error(message), { status: res.status });
  }

  return data;
};

export const getProfile = async () => {
  try {
    const res = await fetch(`${BASE_URL}auth/profile`, {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateProfile = async (params) => {
  let res;

  try {
    res = await fetch(`${BASE_URL}auth/update`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch {
    throw new Error("Network error. Please try again.");
  }

  const ct = res.headers.get("content-type") ?? "";
  const payload = ct.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.error ?? payload?.message;

    throw new Error(message || "Failed to update profile.");
  }

  return payload;
};

export const verifyMe = async () => {
  const res = await fetch(`${BASE_URL}auth/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const ct = res.headers.get("content-type") ?? "";
  const payload = ct.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) return null;

  return payload;
};

export const loadOptions = async (inputValue) => {
  if (!inputValue || inputValue.length < 3) return [];

  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(inputValue)}&apiKey=${GEOAPIFY_KEY}`,
    );
    if (!res.ok) throw new Error(`Geoapify error: ${res.status}`);
    const data = await res.json();
    return (data.features || []).map((f) => ({
      label: f.properties.formatted,
      value: {
        lat: f.properties.lat,
        lon: f.properties.lon,
        addr: f.properties.formatted,
      },
    }));
  } catch (e) {
    console.error("Autocomplete failed:", e);
    return [];
  }
};

export const loadCountries = async () => {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/all?fields=name`);

    if (!res.ok) throw new Error("Rest Countries error");

    const data = await res.json();

    const sortedCountries = data
      .map((c) => c.name.common)
      .sort((a, b) => a.localeCompare(b));

    return sortedCountries;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const startConversation = async (receiverId) => {
  const res = await fetch(`${BASE_URL}conversations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ receiver: receiverId }),
    credentials: "include",
  });
  return await res.json();
};

export const postReview = async (review) => {
  if (!review) return;

  try {
    const res = await fetch(`${BASE_URL}reviews/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    });

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (e) {
    console.error("Fetch error:", e);
  }
};

export const updateReview = async (review) => {
  if (!review) return;

  try {
    const res = await fetch(`${BASE_URL}reviews`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const getReservations = async () => {
  try {
    const res = await fetch(`${BASE_URL}reservations/`, {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const createReservation = async (timeslot_id) => {
  try {
    const res = await fetch(`${BASE_URL}reservations/${timeslot_id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || "Something went wrong while creating reservation";
      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const cancelReservationApi = async (reservation_id) => {
  try {
    const res = await fetch(
      `${BASE_URL}reservations/cancel/${reservation_id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message ||
            "Something went wrong while cancelling reservation";
      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (e) {
    console.error("API Error (cancelReservation):", e);
    throw e;
  }
};

export const confirmReservationApi = async (reservation_id) => {
  try {
    const res = await fetch(
      `${BASE_URL}reservations/confirm/${reservation_id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!res) throw Error("Failed to confirm Reservation");

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message ||
            "Something went wrong while confirming reservation";
      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (err) {
    console.error("Error confirming reservation:", err);
    throw err;
  }
};

export const getReviewsByHostId = async (hostId) => {
  try {
    const res = await fetch(`${BASE_URL}reviews/host/${hostId}`, {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const sendMessage = async (conv_id, receiver_id, content) => {
  try {
    const res = await fetch(`${BASE_URL}conversations/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        conv_id,
        sernder_id: receiver_id,
        content,
      }),
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        throw new Error(data.message || "Failed to send message");
      } else {
        const errorText = await res.text();
        throw new Error(
          `Server error (${res.status}): ${errorText.substring(0, 50)}`,
        );
      }
    }

    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  } catch (error) {
    console.error("Error in sendMessage API:", error);
    throw error;
  }
};

export const updateReservationStatus = async (reservationId, status) => {
  try {
    const res = await fetch(`${BASE_URL}reservations/${reservationId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ booking_status: status }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update status");
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating reservation status:", error);
    throw error;
  }
};

export const getUnreadCount = async () => {
  const response = await fetch(`${BASE_URL}conversations/unread-count`, {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return { count: 0 };
  }

  if (!response.ok) {
    throw new Error("Failed to fetch unread count");
  }

  return response.json();
};

export const resendVerificationEmail = async (email) => {
  try {
    const res = await fetch(`${BASE_URL}auth/resend-verification/${email}`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message || "Something went wrong";

      throw Object.assign(new Error(message), { status: res.status });
    }

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCheckoutSession = async (type, email) => {
  try {
    const res = await fetch(`${BASE_URL}stripe/create-checkout-session`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        email,
      }),
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const getPriceData = async () => {
  try {
    const res = await fetch(`${BASE_URL}reservations/prices`, {
      method: "GET",
      credentials: "include",
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

export const setPriceData = async (prices) => {
  try {
    const res = await fetch(`${BASE_URL}reservations/prices`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prices),
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
};

const PEXELS_API_KEY =
  "VgamRUurIryYslKwBDXsg8TauoQov38LbSgOb5ReDOftOFjPKgJQrH7b";
export async function getCityImage(query) {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=15`,
      { headers: { Authorization: PEXELS_API_KEY } },
    );
    const data = await response.json();
    if (!data.photos || data.photos.length === 0) return null;
    const random = data.photos[Math.floor(Math.random() * data.photos.length)];
    return random.src.large;
  } catch (error) {
    console.error("Pexels haku epäonnistui:", error);
    return null;
  }
}
