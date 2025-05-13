export function getColorByPercentile(value: number) {
  if (value < 1 || value > 100) {
    throw new Error("Value must be between 1 and 100");
  }

  if (value <= 33) {
    return "red"; // First third (1–33)
  } else if (value <= 66) {
    return "yellow"; // Second third (34–66)
  } else {
    return "green"; // Last third (67–100)
  }
}
