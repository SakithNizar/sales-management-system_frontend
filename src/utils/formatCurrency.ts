export const formatCurrency = (value: number | null | undefined | string): string => {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined) {
    return 'Rs. 0';
  }
  
  // Handle string values
  let numValue: number;
  if (typeof value === 'string') {
    numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Rs. 0';
  } else {
    numValue = value;
  }
  
  // Check if it's a valid number
  if (isNaN(numValue) || !isFinite(numValue)) {
    return 'Rs. 0';
  }
  
  return `Rs. ${numValue.toLocaleString()}`;
};