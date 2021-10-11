import { parseCookies, concatCookies } from "./utils/cookie.js";
import encode from "./utils/encode.js";
import fetch, { Response } from "node-fetch";
import { URLSearchParams } from "url";
import { pubKeyProps, cacheProps, infoProps, loginProps } from "./interface";

const username = "username";
const password = "password";

const login = async (): Promise<loginProps> => {
  let cookiesArr: any[] = [];
  const response1 = await fetch(
    "https://healthreport.zju.edu.cn/uc/wap/login?redirect=https%3A%2F%2Fhealthreport.zju.edu.cn%2Fncov%2Fwap%2Fdefault%2Findex",
    {
      method: "GET",
      redirect: "manual",
    }
  );
  cookiesArr.push(...parseCookies(response1.headers.get("set-cookie")));
  const response2 = await fetch(
    "https://zjuam.zju.edu.cn/cas/login?service=https%3A%2F%2Fhealthreport.zju.edu.cn%2Fa_zju%2Fapi%2Fsso%2Findex%3Fredirect%3Dhttps%253A%252F%252Fhealthreport.zju.edu.cn%252Fncov%252Fwap%252Fdefault%252Findex%26from%3Dwap"
  );
  const tmpExe = (await response2.text()).match(/name="execution" value=".+?"/);
  const execution = tmpExe && tmpExe[0].slice(24, -1); //获取execution
  cookiesArr.push(...parseCookies(response2.headers.get("Set-Cookie"))); //获取首页cookie

  const data: Response = await fetch(
    "https://zjuam.zju.edu.cn/cas/v2/getPubKey",
    {
      method: "GET",
      headers: {
        Cookie: concatCookies(cookiesArr),
      },
    }
  );
  cookiesArr.push(...parseCookies(data.headers.get("Set-Cookie"))); //获取公钥cookie
  const dataJson = (await data.json()) as Promise<pubKeyProps>;
  const { modulus, exponent } = await dataJson;
  const encoded = await encode(password, modulus, exponent);

  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", encoded);
  params.append("_eventId", "submit");
  params.append("authcode", "");
  params.append("execution", execution ? execution : "");

  const response3: Response = await fetch(
    "https://zjuam.zju.edu.cn/cas/login?service=https%3A%2F%2Fhealthreport.zju.edu.cn%2Fa_zju%2Fapi%2Fsso%2Findex%3Fredirect%3Dhttps%253A%252F%252Fhealthreport.zju.edu.cn%252Fncov%252Fwap%252Fdefault%252Findex%26from%3Dwap",
    {
      method: "POST",
      headers: {
        Cookie: concatCookies(cookiesArr),
        "Content-type": "application/x-www-form-urlencoded",
      },
      redirect: "follow",
      body: params,
    }
  );

  if (!response3.headers.get("set-cookie")) {
    console.log("👍浙大通行证登录成功");
    // cookiesArr.push(
    //   parseCookies(response3.headers.get("set-cookie")).filter(
    //     ({ name }) =>
    //       name !== "_pm0" && name !== "CASPRIVACY" && name !== "JSESSIONID"
    //   )
    // );
    const html = await response3.text();
    const old_info_tmp: string = html.match(/oldInfo:.+?"id".+?}/)![0].slice(9);
    const def_tmp: string = html.match(/def = {.+?};/)![0].slice(6, -1);
    const name: string = html.match(/realname: ".+?"/)![0].slice(11, -1);
    const number: string = html.match(/number: '.+?'/)![0].slice(9, -1);
    const old_info: infoProps = JSON.parse(old_info_tmp);
    const def: infoProps = JSON.parse(def_tmp);
    return {
      cache: { old_info, def, personal_info: { name, number } },
      cookiesArr,
    }; //获取缓存信息并返回
  } else throw new Error("🙀浙大通行证登录失败");
};

export default login;
