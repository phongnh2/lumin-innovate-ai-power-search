import { AUTH_SERVICE_URL } from 'constants/urls';

export default function redirectToAuth(route) {
  window.location.href = `${AUTH_SERVICE_URL}/${route}?return_to=${encodeURIComponent(window.location.origin)}`;
}
