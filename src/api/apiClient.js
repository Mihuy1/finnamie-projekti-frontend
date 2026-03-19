const BASE_URL = "http://localhost:3000/api/";
const GEOAPIFY_KEY = "b37952a659224430b7545612f420ab9c";

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
          : (payload?.error ?? payload?.message);

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
          : (payload?.error ?? payload?.message);

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
          : (payload?.error ?? payload?.message);

      throw new Error(message || "Upload failed");
    }

    return payload;
  } catch (error) {
    console.error("Error uploading image for timeslot:", error);
    throw new Error("Network error. Please try again.");
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
          : (payload?.error ?? payload?.message);

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
        : (payload?.error ?? payload?.message),
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
        : (payload?.error ?? payload?.message);

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
        : (payload?.error ?? payload?.message);

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

  const ct = res.headers.get("content-type") ?? "";
  const payload = ct.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : (payload?.error ?? payload?.message);

    if (res.status === 409) throw new Error("Email is already in use.");
    throw new Error(message || "Registration failed.");
  }

  return payload;
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
        : (payload?.error ?? payload?.message);

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
  console.log(receiverId);
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
