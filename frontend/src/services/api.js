import { decorateJob } from '../utils/jobDisplay'

const API_BASE_URL = "http://127.0.0.1:5000/api";

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchJobs({ role, location, mode, minSalary, search, company, page = 1, perPage = 6 } = {}) {
  const params = new URLSearchParams();

  if (role && role !== "All Roles") params.append("role", role);
  if (location && location !== "All Locations") params.append("location", location);
  if (mode && mode !== "All Modes") params.append("mode", mode);
  if (minSalary) params.append("minSalary", minSalary);
  if (search) params.append("search", search);
  if (company) params.append("company", company);
  params.append("page", page);
  params.append("perPage", perPage);

  const response = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`);
  const data = await handleResponse(response);

  return {
    ...data,
    jobs: data.jobs.map(decorateJob),
  };
}

export async function fetchJobById(id) {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
  const data = await handleResponse(response);
  return decorateJob(data);
}

export async function fetchCompanies() {
  const response = await fetch(`${API_BASE_URL}/companies`);
  return handleResponse(response);
}

export async function signup({ name, email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(response);
}

export async function login({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(response);
}