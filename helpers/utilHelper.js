export const toNumber = (v) => {
  if (v === null || v === undefined) return 0;

  // Convert comma decimals → dot
  if (typeof v === "string") {
    v = v.replace(",", ".").trim();
  }

  const num = parseFloat(v);
  return isNaN(num) ? 0 : num;
};