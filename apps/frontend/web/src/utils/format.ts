export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const formatHours12 = (locale: string, time: string): string => {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours)) return time;

  const date = new Date(2000, 0, 1, hours, minutes ?? 0);

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: minutes === 0 ? undefined : '2-digit',
    hour12: true,
  }).format(date);
};
