export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function parseHours(hours: string): { open: number; close: number } | null {
  const cleaned = hours.replace(/–/g, '-').replace(/\s/g, '');
  const timeMatch = cleaned.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!timeMatch) return null;
  return { open: parseInt(timeMatch[1]), close: parseInt(timeMatch[3]) };
}

export function getStatusFromHours(giomocua?: string | null): string {
  const hoursStr = giomocua || '';
  if (!hoursStr) return 'Đang mở';
  const parsed = parseHours(hoursStr);
  if (!parsed) return 'Mở';
  const now = new Date();
  const vnOffset = 7 * 60;
  const localOffset = now.getTimezoneOffset();
  const vnHours = (now.getUTCHours() + 7) % 24;
  if (parsed.open <= parsed.close) {
    return vnHours >= parsed.open && vnHours < parsed.close ? 'Đang mở' : 'Đang đóng';
  }
  return vnHours >= parsed.open || vnHours < parsed.close ? 'Đang mở' : 'Đang đóng';
}
