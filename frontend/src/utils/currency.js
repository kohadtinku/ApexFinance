/**
 * Formats a number into Indian Rupee currency format (₹)
 * Example: 1250 => "₹1,250.00", -50 => "-₹50.00", 150000 => "₹1,50,000.00"
 */
export const currency = (n) => {
  const num = Number(n) || 0;
  const isNegative = num < 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));
  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
};

export default currency;
