import { differenceInDays, parse } from 'date-fns';

export const calculateExpiryStatus = (expiryDate: string) => {
  const today = new Date();
  const expiry = parse(expiryDate, 'dd-MM-yyyy', new Date());
  const daysLeft = differenceInDays(expiry, today);
  if (daysLeft < 0) return 'Expired';
  if (daysLeft <= 7) return 'Expiring Soon';
  return 'Good';
};

export const calculateDaysLeft = (expiryDate: string) => {
  const today = new Date();
  const expiry = parse(expiryDate, 'dd-MM-yyyy', new Date());
  const days = differenceInDays(expiry, today);
  return days > 0 ? `${days} days left` : 'Expired';
};