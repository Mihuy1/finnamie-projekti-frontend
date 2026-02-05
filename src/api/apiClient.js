const BASE_URL = "http://localhost:3000/api/";

export const getAllTimeSlots = async () => {
  try {
    const res = await fetch(`${BASE_URL}timeslots`);
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

export const register = async (
  first_name,
  last_name,
  email,
  password,
  role,
) => {
  const res = await fetch(`${BASE_URL}auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name, last_name, email, password, role }),
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
