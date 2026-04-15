const ADMIN_ROLES = new Set(["admin", "staff", "auditor"]);
const STUDENT_ROLES = new Set(["student", "applicant"]);

export function isAdminRole(role: string | null | undefined): boolean {
  return role ? ADMIN_ROLES.has(role.toLowerCase()) : false;
}

export function isStudentRole(role: string | null | undefined): boolean {
  return role ? STUDENT_ROLES.has(role.toLowerCase()) : false;
}
