import { ORG_TEXT } from 'constants/organizationConstants';
import { ORG_ROUTES, Routers } from 'constants/Routers';

export const getRedirectOrgUrl = ({
  orgUrl,
  path,
  search = '',
}: {
  orgUrl: string | null | undefined;
  path: string;
  search?: string;
}): string => (orgUrl ? `/${ORG_TEXT}/${orgUrl}${path}${search}` : Routers.ROOT);

export const getDefaultOrgUrl = ({ orgUrl, search }: { orgUrl: string | null | undefined; search?: string }): string =>
  getRedirectOrgUrl({ orgUrl, path: ORG_ROUTES.HOME_RECENT, search });

export const getTrendingUrl = ({ orgUrl, search }: { orgUrl: string | null | undefined; search?: string }): string =>
  getRedirectOrgUrl({ orgUrl, path: ORG_ROUTES.HOME_TRENDING, search });
