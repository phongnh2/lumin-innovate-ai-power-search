import { PathPattern, matchPath, ParamParseKey, PathMatch } from 'react-router';

export function matchPaths<ParamKey extends ParamParseKey<Path>, Path extends string>(
  patterns: (PathPattern<Path> | Path)[],
  pathname: string
): PathMatch<ParamKey> | null {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const pattern = patterns.find((_pattern) => matchPath(_pattern, pathname));
  if (!pattern) return null;
  return matchPath(pattern, pathname);
}
