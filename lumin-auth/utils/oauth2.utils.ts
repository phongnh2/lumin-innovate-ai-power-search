export function redirect(statusCode: 301 | 303 | 308, url: string) {
  return {
    redirect: {
      statusCode: statusCode,
      destination: url
    }
  };
}
