import parse, { splitCookiesString } from "set-cookie-parser";

interface cookieProps {
  name: string;
  value: string;
}

export function parseCookies(headers: string | null) {
  const cookiesArr: string[] = headers ? splitCookiesString(headers) : [];
  return parse(cookiesArr).map(({ name, value }) => ({ name, value })); //拿出cookie中的name, value值
}

export function concatCookies(cookies: cookieProps[]) {
  return cookies
    .map(
      ({ name, value }) =>
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
    )
    .join(";");
}
