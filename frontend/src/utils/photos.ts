export const MINI_CAR_PLACEHOLDER_URL = '/placeholder-mini-car.svg';

export function getMiniCarPhotoUrl(photoUrl?: string) {
  return photoUrl || MINI_CAR_PLACEHOLDER_URL;
}
