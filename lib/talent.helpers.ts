/**
 * Shared vocabulary for the talent pipeline.
 *
 * These lists are the single source of truth for both sides of the marketplace:
 * businesses pick specialties when they request talent, and (once alumni
 * profiles land) graduates pick from the same list. Keeping one catalogue is
 * what makes the two sides matchable at all — divergent labels would leave
 * every request needing a human translation step.
 *
 * Stored values are the stable `key`. Labels are display-only and safe to
 * reword; changing a key would orphan existing records.
 */

export type LabelledOption<T extends string> = {
  key: T;
  label: string;
};

export const TALENT_SPECIALTIES = [
  { key: "cookery", label: "Cookery" },
  { key: "baking", label: "Baking" },
  { key: "pastries", label: "Pastries" },
  { key: "mixology", label: "Mixology" },
  { key: "grilling", label: "Grilling" },
] as const satisfies ReadonlyArray<LabelledOption<string>>;

export type TalentSpecialty = (typeof TALENT_SPECIALTIES)[number]["key"];

export const HIRE_PERIODS = [
  { key: "short_term", label: "Short term" },
  { key: "long_term", label: "Long term" },
] as const satisfies ReadonlyArray<LabelledOption<string>>;

export type HirePeriod = (typeof HIRE_PERIODS)[number]["key"];

export const JOB_DURATIONS = [
  { key: "full_time", label: "Full time" },
  { key: "part_time", label: "Part time" },
  { key: "one_off", label: "One off" },
] as const satisfies ReadonlyArray<LabelledOption<string>>;

export type JobDuration = (typeof JOB_DURATIONS)[number]["key"];

/**
 * The placement pipeline, in the order work actually moves.
 *
 * `new` means nobody has touched it yet, which is the only state that counts
 * against response time. `closed` is deliberately terminal-but-not-deleted so a
 * request that went nowhere still shows up in fill-rate reporting.
 */
export const TALENT_REQUEST_STATUSES = [
  { key: "new", label: "New" },
  { key: "in_review", label: "In review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "placed", label: "Placed" },
  { key: "closed", label: "Closed" },
] as const satisfies ReadonlyArray<LabelledOption<string>>;

export type TalentRequestStatus =
  (typeof TALENT_REQUEST_STATUSES)[number]["key"];

const toKeys = <T extends string>(
  options: ReadonlyArray<LabelledOption<T>>,
): T[] => options.map((option) => option.key);

const toLabelMap = <T extends string>(
  options: ReadonlyArray<LabelledOption<T>>,
): Record<T, string> =>
  Object.fromEntries(options.map((o) => [o.key, o.label])) as Record<T, string>;

export const TALENT_SPECIALTY_KEYS = toKeys(TALENT_SPECIALTIES);
export const HIRE_PERIOD_KEYS = toKeys(HIRE_PERIODS);
export const JOB_DURATION_KEYS = toKeys(JOB_DURATIONS);
export const TALENT_REQUEST_STATUS_KEYS = toKeys(TALENT_REQUEST_STATUSES);

export const SPECIALTY_LABELS = toLabelMap(TALENT_SPECIALTIES);
export const HIRE_PERIOD_LABELS = toLabelMap(HIRE_PERIODS);
export const JOB_DURATION_LABELS = toLabelMap(JOB_DURATIONS);
export const TALENT_REQUEST_STATUS_LABELS = toLabelMap(TALENT_REQUEST_STATUSES);

export const isTalentSpecialty = (value: string): value is TalentSpecialty =>
  (TALENT_SPECIALTY_KEYS as string[]).includes(value);

/**
 * Renders stored specialty keys for display. Unknown keys are kept verbatim
 * rather than dropped, so a record written before a catalogue edit still shows
 * something meaningful instead of silently losing a requirement.
 */
export const formatSpecialties = (keys: readonly string[]): string =>
  keys.map((key) => SPECIALTY_LABELS[key as TalentSpecialty] ?? key).join(", ");

/** Word count used by both the client counter and the server-side cap. */
export const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

/**
 * Field limits shared by the public form's zod schema and the server-side
 * check. One set of numbers, two callers — a client-only cap is not a cap,
 * since anyone can call the mutation directly.
 */
export const TALENT_LIMITS = {
  companyNameMin: 2,
  companyNameMax: 120,
  emailMax: 254,
  phoneMin: 7,
  phoneMax: 20,
  specialtiesMin: 1,
  // Derived from the catalogue: a cap above the number of options can never be
  // hit, so it would silently stop being a cap as the list grows or shrinks.
  specialtiesMax: TALENT_SPECIALTIES.length,
  descriptionMin: 20,
  descriptionMaxWords: 400,
  /**
   * A hard character ceiling on top of the word cap. Word counting alone lets a
   * single 100k-character "word" through and bloats the document.
   */
  descriptionMaxChars: 4000,
  outcomeNoteMax: 1000,
} as const;

/** Deliberately permissive — real addresses vary more than most regexes allow. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Digits, and the punctuation people actually type into phone fields. */
const PHONE_ALLOWED_PATTERN = /^[\d\s+()-]+$/;

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

/**
 * Strips display punctuation, keeping a single leading `+`. Storing a canonical
 * form is what lets staff recognise a repeat caller — "+234 803 123 4567" and
 * "08031234567" are otherwise two different businesses to the naked eye.
 */
export const normalizePhone = (phone: string): string => {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
};

export type TalentRequestField =
  | "companyName"
  | "companyEmail"
  | "contactPhone"
  | "specialties"
  | "description";

export type TalentRequestInput = {
  companyName: string;
  companyEmail: string;
  contactPhone: string;
  specialties: string[];
  description: string;
};

export type TalentValidationError = {
  field: TalentRequestField;
  message: string;
};

/**
 * Validates a talent request. Returns the first problem found, or null when the
 * input is acceptable.
 *
 * Pure and dependency-free so the same rules run in the Convex mutation and in
 * unit tests without a running backend.
 */
export const validateTalentRequest = (
  input: TalentRequestInput,
): TalentValidationError | null => {
  const companyName = input.companyName.trim();
  if (companyName.length < TALENT_LIMITS.companyNameMin) {
    return { field: "companyName", message: "Enter your company name." };
  }
  if (companyName.length > TALENT_LIMITS.companyNameMax) {
    return {
      field: "companyName",
      message: `Company name must be ${TALENT_LIMITS.companyNameMax} characters or fewer.`,
    };
  }

  const email = normalizeEmail(input.companyEmail);
  if (email.length === 0) {
    return { field: "companyEmail", message: "Enter a company email." };
  }
  if (email.length > TALENT_LIMITS.emailMax || !EMAIL_PATTERN.test(email)) {
    return {
      field: "companyEmail",
      message: "Enter a valid email address.",
    };
  }

  const rawPhone = input.contactPhone.trim();
  const phone = normalizePhone(rawPhone);
  if (!PHONE_ALLOWED_PATTERN.test(rawPhone)) {
    return {
      field: "contactPhone",
      message: "Phone number can only contain digits, spaces, +, -, and ().",
    };
  }
  if (
    phone.replace("+", "").length < TALENT_LIMITS.phoneMin ||
    phone.length > TALENT_LIMITS.phoneMax
  ) {
    return { field: "contactPhone", message: "Enter a valid phone number." };
  }

  const specialties = Array.from(new Set(input.specialties));
  if (specialties.length < TALENT_LIMITS.specialtiesMin) {
    return {
      field: "specialties",
      message: "Select at least one specialty.",
    };
  }
  if (specialties.length > TALENT_LIMITS.specialtiesMax) {
    return {
      field: "specialties",
      message: `Select ${TALENT_LIMITS.specialtiesMax} specialties or fewer.`,
    };
  }
  const unknown = specialties.filter((key) => !isTalentSpecialty(key));
  if (unknown.length > 0) {
    return {
      field: "specialties",
      message: "One or more selected specialties are not recognised.",
    };
  }

  const description = input.description.trim();
  if (description.length < TALENT_LIMITS.descriptionMin) {
    return {
      field: "description",
      message: `Describe the talent you need in at least ${TALENT_LIMITS.descriptionMin} characters.`,
    };
  }
  if (description.length > TALENT_LIMITS.descriptionMaxChars) {
    return {
      field: "description",
      message: `Description must be ${TALENT_LIMITS.descriptionMaxChars} characters or fewer.`,
    };
  }
  const words = countWords(description);
  if (words > TALENT_LIMITS.descriptionMaxWords) {
    return {
      field: "description",
      message: `Description must be ${TALENT_LIMITS.descriptionMaxWords} words or fewer (currently ${words}).`,
    };
  }

  return null;
};
