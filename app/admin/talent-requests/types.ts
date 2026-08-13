import type { Doc } from "~/convex/_generated/dataModel";

/**
 * A talent request as returned by `api.talentRequests.list` — the stored record
 * plus the reviewing staff member's name, resolved server-side so each row does
 * not need its own lookup.
 */
export type TalentRequestRow = Doc<"talentRequests"> & {
  reviewedByName: string | null;
};

export type TalentRequestCounts = {
  all: number;
  new: number;
  in_review: number;
  shortlisted: number;
  placed: number;
  closed: number;
};
