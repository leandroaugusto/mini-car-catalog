export const MINI_CAR_PLACEHOLDER_URL = '/placeholder-mini-car.png';

export function getMiniCarPhotoUrl(photoUrl?: string) {
  return photoUrl || MINI_CAR_PLACEHOLDER_URL;
}
