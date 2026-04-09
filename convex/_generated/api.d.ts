/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alumni from "../alumni.js";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as clerk from "../clerk.js";
import type * as cohorts from "../cohorts.js";
import type * as courses from "../courses.js";
import type * as crons from "../crons.js";
import type * as debug from "../debug.js";
import type * as enrollments from "../enrollments.js";
import type * as faqs from "../faqs.js";
import type * as http from "../http.js";
import type * as instructors from "../instructors.js";
import type * as invitations from "../invitations.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as quizzes from "../quizzes.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as storage from "../storage.js";
import type * as students from "../students.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alumni: typeof alumni;
  applications: typeof applications;
  auth: typeof auth;
  clerk: typeof clerk;
  cohorts: typeof cohorts;
  courses: typeof courses;
  crons: typeof crons;
  debug: typeof debug;
  enrollments: typeof enrollments;
  faqs: typeof faqs;
  http: typeof http;
  instructors: typeof instructors;
  invitations: typeof invitations;
  notifications: typeof notifications;
  payments: typeof payments;
  quizzes: typeof quizzes;
  reviews: typeof reviews;
  seed: typeof seed;
  settings: typeof settings;
  storage: typeof storage;
  students: typeof students;
  users: typeof users;
  utils: typeof utils;
  webhooks: typeof webhooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
