const baseUrl = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080").replace(/\/+$/, "");
const moviesUrl = `${baseUrl}/api/movies`;

async function request(path = "", options = {}) {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${moviesUrl}${path}`, { ...options, headers });
  if (!response.ok) {
    let message;
    try {
      message = (await response.json()).message;
    } catch {
      // Some server errors do not include a JSON response body.
    }
    throw new Error(message || `Movie request failed (${response.status}).`);
  }
  if (response.status === 204 || options.method === "DELETE") return undefined;
  return response.json();
}

export function getAllMovies() {
  return request();
}

export function getMovieById(id) {
  return request(`/${encodeURIComponent(id)}`);
}

export function createMovie(movie) {
  return request("", { method: "POST", body: JSON.stringify(movie) });
}

export function updateMovie(id, movie) {
  return request(`/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(movie),
  });
}

export function deleteMovie(id) {
  return request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
}
