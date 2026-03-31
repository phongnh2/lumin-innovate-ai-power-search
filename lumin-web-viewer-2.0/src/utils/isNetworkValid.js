import { AXIOS_BASEURL } from 'constants/urls';

export default async () => {
  try {
    const response = await fetch(AXIOS_BASEURL);
    return Boolean(response);
  } catch {
    return false;
  }
};
