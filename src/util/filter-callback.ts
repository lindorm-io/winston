export const defaultFilterCallback = (data: any): string => {
  if (!data) return null;
  return "[Filtered]";
};
