export type PrivilegeEntry = {
  key: string;
  label: string;
};

export type PrivilegeGroup = {
  label: string;
  items: PrivilegeEntry[];
};

export const PRIVILEGES_CONFIG: PrivilegeGroup[] = [
  {
    label: "User & Role Management",
    items: [
      { key: "user:read", label: "View user profiles" },
      { key: "user:update", label: "Modify user details" },
      { key: "user:assign:role", label: "Assign or change user roles" },
      { key: "student:read", label: "View a student's enrollment details" },
      { key: "student:read:list", label: "View all enrolled students" },
      { key: "profile:read:own", label: "View own profile" },
      { key: "profile:update:own", label: "Update own profile" },
    ],
  },
  {
    label: "Application Management",
    items: [
      { key: "application:create", label: "Start a new application" },
      { key: "application:read:all", label: "View all applications" },
      { key: "application:read:own", label: "View own application" },
      { key: "application:update:own", label: "Edit a draft application" },
      {
        key: "application:update:status",
        label: "Approve or decline applications",
      },
      { key: "application:submit", label: "Submit a completed application" },
      { key: "application:delete", label: "Delete an application" },
      {
        key: "application:view:details",
        label: "View full application details",
      },
    ],
  },
  {
    label: "Enrollment Management",
    items: [
      { key: "enrollment:read:all", label: "View all enrollment records" },
      { key: "enrollment:read:own", label: "View own enrollment progress" },
      { key: "enrollment:update", label: "Manually update enrollment status" },
      { key: "enrollment:step:complete", label: "Complete enrollment steps" },
      {
        key: "enrollment:view:details",
        label: "View detailed enrollment info",
      },
    ],
  },
  {
    label: "Cohort Management",
    items: [
      {
        key: "cohort:manage",
        label: "Create, edit, and assign students to cohorts",
      },
      {
        key: "cohort:read:all",
        label: "View all cohorts and enrolled students",
      },
    ],
  },
  {
    label: "Course Management",
    items: [
      { key: "course:manage", label: "Create, update, and delete courses" },
      { key: "course:read:all", label: "View all courses" },
    ],
  },
  {
    label: "Instructor Management",
    items: [
      {
        key: "instructor:manage",
        label: "Create, update, and delete instructors",
      },
      { key: "instructor:read", label: "View instructor list" },
    ],
  },
  {
    label: "Review Management",
    items: [
      { key: "review:manage", label: "Approve and delete reviews" },
      { key: "review:create", label: "Create reviews" },
    ],
  },
  {
    label: "Content Management",
    items: [
      {
        key: "content:manage",
        label: "Create, update, and delete educational content",
      },
    ],
  },
  {
    label: "Payment Management",
    items: [
      { key: "payment:read:all", label: "View all payment transactions" },
      { key: "payment:create", label: "Initiate a payment" },
      { key: "payment:refund", label: "Process refunds" },
    ],
  },
  {
    label: "Notification Management",
    items: [
      {
        key: "notification:read:admin",
        label: "View administrative notifications",
      },
      { key: "notification:read:own", label: "View personal notifications" },
    ],
  },
  {
    label: "Student Resources",
    items: [
      {
        key: "resource:access:student_portal",
        label: "Access the student dashboard",
      },
      { key: "resource:read:materials", label: "View educational materials" },
    ],
  },
  {
    label: "Reporting & Auditing",
    items: [
      { key: "report:view:dashboard", label: "Access the main dashboard" },
      { key: "report:generate", label: "Generate and export reports" },
    ],
  },
  {
    label: "System Settings",
    items: [
      {
        key: "settings:update",
        label: "Configure global application settings",
      },
    ],
  },
];

export const ALL_PRIVILEGE_KEYS = PRIVILEGES_CONFIG.flatMap((g) =>
  g.items.map((i) => i.key),
);

export const SYSTEM_ROLE_NAMES = new Set([
  "Admin",
  "Staff",
  "Auditor",
  "Applicant",
  "Student",
]);
