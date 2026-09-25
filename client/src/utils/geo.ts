export function getGoogleMapsDirectionsUrl(lat: number, lng: number, name: string): string {
  const dest = encodeURIComponent(`${name} ${lat},${lng}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

export function getAppleMapsUrl(lat: number, lng: number, name: string): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(name)}`;
}

export async function getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}
