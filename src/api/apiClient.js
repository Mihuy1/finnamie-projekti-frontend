const BASE_URL = "http://localhost:3000/api/";

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
  }
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

export const verifyMe = async () => {
  const res = await fetch(`${BASE_URL}auth/me`, {
    method: "GET",
    credentials: "include",
  });
  const ct = res.headers.get("content-type") ?? "";
  const payload = ct.includes("application/json")
    ? await res.json()
    : await res.text();

  if (!res.ok) return null;

  return payload;
};
