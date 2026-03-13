import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Refresh analytics cache every day at 1 AM
crons.daily(
  "refresh-revenue-trends",
  { hourUTC: 1, minuteUTC: 0 },
  internal.payments.refreshRevenueCache,
);

export default crons;
