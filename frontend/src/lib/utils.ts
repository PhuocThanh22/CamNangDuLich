export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function parseHours(hours: string): { open: number; close: number } | null {
  const cleaned = hours.replace(/[–—]/g, '-').replace(/\s+/g, '');
  const timeMatch = cleaned.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
  if (!timeMatch) return null;
  return {
    open: parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10),
    close: parseInt(timeMatch[3], 10) * 60 + parseInt(timeMatch[4], 10),
  };
}

export function getStatusFromHours(giomocua?: string | null): string {
  const hoursStr = (giomocua || '').trim();
  if (!hoursStr) return 'Đang mở';
  const parsed = parseHours(hoursStr);
  if (!parsed) return 'Đang mở';
  const now = new Date();
  const vnMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + 7 * 60) % (24 * 60);
  if (parsed.open <= parsed.close) {
    return vnMinutes >= parsed.open && vnMinutes < parsed.close ? 'Đang mở' : 'Đang đóng';
  }
  return vnMinutes >= parsed.open || vnMinutes < parsed.close ? 'Đang mở' : 'Đang đóng';
}
