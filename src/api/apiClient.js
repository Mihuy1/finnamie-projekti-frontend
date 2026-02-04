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
        : (payload?.error ?? "Login failed"),
    );
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
