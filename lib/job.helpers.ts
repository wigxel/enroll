const compactFormatter = new Intl.NumberFormat("en-NG", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullFormatter = new Intl.NumberFormat("en-NG");

/**
 * Renders a per-annum salary range. Collapses to a single figure when both ends
 * match, since "₦2M – ₦2M" reads as a formatting bug to users.
 */
export const formatSalaryRange = (
  min: number,
  max: number,
  options: { compact?: boolean } = {},
): string => {
  const format = options.compact
    ? (value: number) => compactFormatter.format(value)
    : (value: number) => fullFormatter.format(value);

  if (min === max) return `₦${format(min)}`;

  return `₦${format(min)} – ₦${format(max)}`;
};
