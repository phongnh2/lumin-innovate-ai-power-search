function defineWarningBanners<T extends readonly string[]>(keys: T) {
  return Object.fromEntries(keys.map((key, index) => [key, { value: key.toLowerCase(), priority: index + 1 }])) as {
    readonly [K in T[number]]: { readonly value: string; readonly priority: number };
  };
}

export default defineWarningBanners;
