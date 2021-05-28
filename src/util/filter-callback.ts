export const defaultFilterCallback = (data: any): string | null => {
  if (!data) return null;
  return "[Filtered]";
};
