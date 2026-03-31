export interface ISitemapUrl {
  loc: string;
  lastmod?: string | undefined;
  changefreq?: string | undefined;
  priority?: string | undefined;
}

export interface IUrlCheckResult {
  url: string;
  exists: boolean;
}

export interface ISitemapService {
  parseSitemapXml(filePath: string): Promise<ISitemapUrl[]>;
  checkUrlsInSitemap(): Promise<void>;
}
