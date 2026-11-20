export function eventChatExpiry(dateISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateISO || ""))) return null;
  const closesAt = new Date(`${dateISO}T23:59:59.999Z`);
  if (Number.isNaN(closesAt.getTime())) return null;
  return { closesAt, expiresAt: new Date(closesAt.getTime() + 48 * 60 * 60 * 1000) };
}

export function validProfileMediaMix(photoCount, videoCount) {
  return Number.isInteger(photoCount) && Number.isInteger(videoCount) && photoCount >= 0 && videoCount >= 0 && photoCount + videoCount <= 5 && videoCount <= 2 && (videoCount === 0 || photoCount <= 3);
}
