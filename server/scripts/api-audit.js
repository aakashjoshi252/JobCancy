#!/usr/bin/env node

require("dotenv").config();

const DEFAULT_BASE_URL = `http://localhost:${process.env.PORT || 3000}`;
const BASE_URL = (process.env.API_AUDIT_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
const DUMMY_ID = "507f1f77bcf86cd799439011";

const tokenEnv = {
  candidate: process.env.API_AUDIT_CANDIDATE_TOKEN || "",
  recruiter: process.env.API_AUDIT_RECRUITER_TOKEN || "",
  admin: process.env.API_AUDIT_ADMIN_TOKEN || "",
};

const loginConfig = {
  candidate: {
    email: process.env.API_AUDIT_CANDIDATE_EMAIL,
    password: process.env.API_AUDIT_CANDIDATE_PASSWORD,
  },
  recruiter: {
    email: process.env.API_AUDIT_RECRUITER_EMAIL,
    password: process.env.API_AUDIT_RECRUITER_PASSWORD,
  },
  admin: {
    email: process.env.API_AUDIT_ADMIN_EMAIL,
    password: process.env.API_AUDIT_ADMIN_PASSWORD,
  },
};

const checks = [
  { name: "Health", method: "GET", path: "/health", expect: [200] },
  { name: "Root", method: "GET", path: "/", expect: [200] },

  { name: "User register route", method: "POST", path: "/api/v1/user/register", expect: [400, 409] },
  { name: "User login route", method: "POST", path: "/api/v1/user/login", expect: [400, 401] },
  { name: "User me", method: "GET", path: "/api/v1/user/me", auth: "candidate", expect: [200, 401] },
  { name: "User profile update", method: "PATCH", path: "/api/v1/user/profile", auth: "candidate", expect: [200, 400, 401] },
  { name: "User logout", method: "POST", path: "/api/v1/user/logout", auth: "candidate", expect: [200, 401] },

  { name: "Company list", method: "GET", path: "/api/v1/company", expect: [200] },
  { name: "Company create", method: "POST", path: "/api/v1/company", auth: "recruiter", expect: [400, 401, 403, 409] },
  { name: "Company update", method: "PATCH", path: `/api/v1/company/${DUMMY_ID}`, auth: "recruiter", expect: [401, 403, 404] },
  { name: "Company delete", method: "DELETE", path: `/api/v1/company/${DUMMY_ID}`, auth: "recruiter", expect: [401, 403, 404] },

  { name: "Jobs list", method: "GET", path: "/api/v1/jobs", expect: [200] },
  { name: "Jobs recommended", method: "GET", path: "/api/v1/jobs/recommended", auth: "candidate", expect: [200, 401, 403] },
  { name: "Jobs create", method: "POST", path: "/api/v1/jobs", auth: "recruiter", expect: [400, 401, 403] },
  { name: "Jobs update", method: "PATCH", path: `/api/v1/jobs/${DUMMY_ID}`, auth: "recruiter", expect: [400, 401, 403, 404] },
  { name: "Jobs delete", method: "DELETE", path: `/api/v1/jobs/${DUMMY_ID}`, auth: "recruiter", expect: [401, 403, 404] },

  { name: "Application submit", method: "POST", path: "/api/v1/application", auth: "candidate", expect: [400, 401, 403] },
  { name: "Applications current role", method: "GET", path: "/api/v1/application", auth: "candidate", expect: [200, 401, 403] },
  { name: "My applications", method: "GET", path: "/api/v1/application/my-applications", auth: "candidate", expect: [200, 401, 403] },
  { name: "Applications by job", method: "GET", path: `/api/v1/application/job/${DUMMY_ID}`, auth: "recruiter", expect: [401, 403, 404] },
  { name: "Application status", method: "PATCH", path: `/api/v1/application/${DUMMY_ID}/status`, auth: "recruiter", body: { status: "Reviewing" }, expect: [401, 403, 404] },

  { name: "Chat list", method: "GET", path: "/api/v1/chat", auth: "candidate", expect: [200, 401, 403] },
  { name: "Chat messages", method: "GET", path: `/api/v1/chat/${DUMMY_ID}/messages`, auth: "candidate", expect: [200, 401, 403, 404] },
  { name: "Chat send message", method: "POST", path: `/api/v1/chat/${DUMMY_ID}/message`, auth: "candidate", expect: [400, 401, 403, 404] },
  { name: "Chat mark read", method: "PATCH", path: `/api/v1/chat/${DUMMY_ID}/read`, auth: "candidate", expect: [200, 401, 403, 404] },

  { name: "Notifications list", method: "GET", path: "/api/v1/notifications", auth: "candidate", expect: [200, 401] },
  { name: "Notifications unread count", method: "GET", path: "/api/v1/notifications/unread-count", auth: "candidate", expect: [200, 401] },
  { name: "Notification mark read", method: "PATCH", path: `/api/v1/notifications/${DUMMY_ID}/read`, auth: "candidate", expect: [200, 401, 404] },
  { name: "Notification mark all", method: "PATCH", path: "/api/v1/notifications/mark-all-read", auth: "candidate", expect: [200, 401] },
  { name: "Notification delete", method: "DELETE", path: `/api/v1/notifications/${DUMMY_ID}`, auth: "candidate", expect: [200, 401, 404] },

  { name: "Blogs list", method: "GET", path: "/api/v1/blogs", expect: [200] },
  { name: "Blogs published", method: "GET", path: "/api/v1/blogs/published", expect: [200] },
  { name: "Blogs slug", method: "GET", path: "/api/v1/blogs/slug/non-existent-audit-slug", expect: [404] },
  { name: "Blogs create", method: "POST", path: "/api/v1/blogs", auth: "admin", expect: [400, 401, 403] },
  { name: "Blogs update", method: "PATCH", path: `/api/v1/blogs/${DUMMY_ID}`, auth: "admin", expect: [400, 401, 403, 404] },
  { name: "Blogs delete", method: "DELETE", path: `/api/v1/blogs/${DUMMY_ID}`, auth: "admin", expect: [401, 403, 404] },

  { name: "Subscription plans", method: "GET", path: "/api/v1/subscription/plans", auth: "recruiter", expect: [200, 401, 403] },
  { name: "Subscription order", method: "POST", path: "/api/v1/subscription/create-order", auth: "recruiter", expect: [400, 401, 403] },
  { name: "Subscription verify", method: "POST", path: "/api/v1/subscription/verify-payment", auth: "recruiter", expect: [400, 401, 403] },
  { name: "My subscription", method: "GET", path: "/api/v1/subscription/my-subscription", auth: "recruiter", expect: [200, 401, 403] },
  { name: "Subscription transactions", method: "GET", path: "/api/v1/subscription/transactions", auth: "recruiter", expect: [200, 401, 403] },
  { name: "Subscription usage", method: "GET", path: "/api/v1/subscription/usage", auth: "recruiter", expect: [200, 401, 403] },

  { name: "Admin dashboard", method: "GET", path: "/api/v1/admin/dashboard", auth: "admin", expect: [200, 401, 403] },
  { name: "Admin users", method: "GET", path: "/api/v1/admin/users", auth: "admin", expect: [200, 401, 403] },
  { name: "Admin recruiters", method: "GET", path: "/api/v1/admin/recruiters", auth: "admin", expect: [200, 401, 403] },
  { name: "Admin candidates", method: "GET", path: "/api/v1/admin/candidates", auth: "admin", expect: [200, 401, 403] },
  { name: "Admin jobs", method: "GET", path: "/api/v1/admin/jobs", auth: "admin", expect: [200, 401, 403] },
  { name: "Admin applications", method: "GET", path: "/api/v1/admin/applications", auth: "admin", expect: [200, 401, 403] },
  { name: "Admin reports", method: "GET", path: "/api/v1/admin/reports", auth: "admin", expect: [200, 401, 403] },

  { name: "Interviews list", method: "GET", path: "/api/v1/interviews", auth: "recruiter", expect: [200, 400, 401, 403] },
  { name: "Interviews create", method: "POST", path: "/api/v1/interviews", auth: "recruiter", expect: [400, 401, 403] },
  { name: "Interviews update", method: "PATCH", path: `/api/v1/interviews/${DUMMY_ID}`, auth: "recruiter", expect: [401, 403, 404] },
  { name: "Interviews delete", method: "DELETE", path: `/api/v1/interviews/${DUMMY_ID}`, auth: "recruiter", expect: [401, 403, 404] },

  { name: "Resume builder list", method: "GET", path: "/api/v1/pdf", auth: "candidate", expect: [200, 401] },
  { name: "Resume builder generate", method: "POST", path: "/api/v1/pdf/generate", auth: "candidate", expect: [400, 401, 404] },
];

async function login(role) {
  if (tokenEnv[role]) return tokenEnv[role];
  const config = loginConfig[role];
  if (!config.email || !config.password) return "";

  const response = await fetch(`${BASE_URL}/api/v1/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: config.email, password: config.password }),
  });

  const data = await safeJson(response);
  return data?.token || data?.data?.token || "";
}

async function safeJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function runCheck(check, tokens) {
  const headers = { Accept: "application/json" };
  if (check.body !== undefined || check.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const token = check.auth ? tokens[check.auth] : "";
  if (check.auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${check.path}`, {
    method: check.method,
    headers,
    body: check.body !== undefined ? JSON.stringify(check.body) : undefined,
  });

  const data = await safeJson(response);
  const routeNotFound = response.status === 404 && /Route .* not found/i.test(data?.message || "");
  const ok = check.expect.includes(response.status) && !routeNotFound;

  return {
    ...check,
    status: response.status,
    ok,
    message: data?.message || data?.error || "",
    routeNotFound,
  };
}

async function main() {
  console.log(`API audit target: ${BASE_URL}`);

  const tokens = {
    candidate: await login("candidate"),
    recruiter: await login("recruiter"),
    admin: await login("admin"),
  };

  const results = [];
  for (const check of checks) {
    try {
      results.push(await runCheck(check, tokens));
    } catch (error) {
      results.push({
        ...check,
        status: "ERR",
        ok: false,
        message: error.message,
      });
    }
  }

  const rows = results.map((result) => ({
    status: result.ok ? "PASS" : "FAIL",
    method: result.method,
    path: result.path,
    http: result.status,
    auth: result.auth || "none",
    message: result.routeNotFound ? "Route not registered" : result.message,
  }));

  console.table(rows);

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`API audit failed: ${failed.length} check(s) need attention.`);
    process.exit(1);
  }

  console.log("API audit passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
