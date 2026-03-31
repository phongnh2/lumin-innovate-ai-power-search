export class SignedUrlConstants {
  public static readonly LUMIN_DATE_QUERY_PARAM = 'X-Lumin-Date';

  public static readonly SIGNED_HEADERS_QUERY_PARAM = 'X-Lumin-SignedHeaders';

  public static readonly EXPIRES_QUERY_PARAM = 'X-Lumin-Expires';

  public static readonly SIGNATURE_QUERY_PARAM = 'X-Lumin-Signature';

  public static readonly ALLOWED_SOCKET_PATTERNS_PARAM = 'X-Lumin-Allow-Patterns';

  public static readonly UNSIGNED_PAYLOAD = 'UNSIGNED-PAYLOAD';

  public static readonly PROXY_HEADER_PATTERN = /^proxy-/;

  public static readonly SEC_HEADER_PATTERN = /^sec-/;
}
