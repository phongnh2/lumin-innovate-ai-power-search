export const buildLogoDevUrl = (emailDomain: string, publishableKey: string) => {
  if (!emailDomain) return null;
  const url = new URL(`https://img.logo.dev/${emailDomain}`);
  url.searchParams.set('token', publishableKey);
  url.searchParams.set('fallback', '404');
  return url.toString();
};
