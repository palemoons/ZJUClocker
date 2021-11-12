import { parseCookies, concatCookies } from './utils/cookie.js';
import encode from './utils/encode.js';
import axios from 'axios';
import { pubKeyProps, infoProps, loginProps } from './interface';
import config from './config.json';

const username = config.name;
const password = config.password;

const login = async (): Promise<loginProps> => {
  const http = axios.create();
  let cookiesArr: any[] = [];
  const response1 = await http({
    url: 'https://healthreport.zju.edu.cn/uc/wap/login?redirect=https%3A%2F%2Fhealthreport.zju.edu.cn%2Fncov%2Fwap%2Fdefault%2Findex',
    maxRedirects: 0,
    validateStatus: function (status) {
      return status >= 200 && status < 400;
    },
  });
  cookiesArr.push(...parseCookies(response1.headers['set-cookie']!.join()));

  const response2 = await http(
    'https://zjuam.zju.edu.cn/cas/login?service=https%3A%2F%2Fhealthreport.zju.edu.cn%2Fa_zju%2Fapi%2Fsso%2Findex%3Fredirect%3Dhttps%253A%252F%252Fhealthreport.zju.edu.cn%252Fncov%252Fwap%252Fdefault%252Findex%26from%3Dwap'
  );

  const tmpExe = (await response2.data).match(/name="execution" value=".+?"/);
  const execution = tmpExe && tmpExe[0].slice(24, -1); //获取execution
  cookiesArr.push(...parseCookies(response2.headers['set-cookie']!.join())); //获取首页cookie

  const data = await http({
    url: 'https://zjuam.zju.edu.cn/cas/v2/getPubKey',
    method: 'GET',
    headers: {
      Cookie: concatCookies(cookiesArr),
    },
  });
  cookiesArr.push(...parseCookies(data.headers['set-cookie']!.join())); //获取公钥cookie
  const dataJson = (await data.data) as Promise<pubKeyProps>;
  const { modulus, exponent } = await dataJson;
  const encoded = await encode(password, modulus, exponent);

  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', encoded);
  params.append('_eventId', 'submit');
  params.append('authcode', '');
  params.append('execution', execution);

  const response3 = await http({
    url: 'https://zjuam.zju.edu.cn/cas/login?service=https%3A%2F%2Fhealthreport.zju.edu.cn%2Fa_zju%2Fapi%2Fsso%2Findex%3Fredirect%3Dhttps%253A%252F%252Fhealthreport.zju.edu.cn%252Fncov%252Fwap%252Fdefault%252Findex%26from%3Dwap',
    method: 'POST',
    headers: {
      Cookie: concatCookies(cookiesArr),
      'Content-type': 'application/x-www-form-urlencoded',
    },
    params: params,
    timeout: 5000,
  });
  if (!response3.headers['set-cookie']) {
    console.log('👍浙大通行证登录成功');

    const response4 = await http({
      url: 'https://zjuam.zju.edu.cn/cas/login?service=https%3A%2F%2Fhealthreport.zju.edu.cn%2Fa_zju%2Fapi%2Fsso%2Findex%3Fredirect%3Dhttps%253A%252F%252Fhealthreport.zju.edu.cn%252Fncov%252Fwap%252Fdefault%252Findex%26from%3Dwap',
      method: 'POST',
      headers: {
        Cookie: concatCookies(cookiesArr),
        'Content-type': 'application/x-www-form-urlencoded',
      },
      params: params,
      timeout: 5000,
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400;
      },
    });
    cookiesArr.push(
      ...parseCookies(response4.headers['set-cookie']!.join()).filter(
        ({ name }) => name !== '_pm0' && name !== 'CASPRIVACY'
      )
    );
    
    
    const html = await response3.data;
    const old_info_tmp: string = html.match(/oldInfo:.+?\n/)![0].slice(9, -2);
    const def_tmp: string = html.match(/def = {.+?};/)![0].slice(6, -1);
    const name: string = html.match(/realname: ".+?"/)![0].slice(11, -1);
    const number: string = html.match(/number: '.+?'/)![0].slice(9, -1);
    const old_info: infoProps = JSON.parse(old_info_tmp);
    const def: infoProps = JSON.parse(def_tmp);
    return {
      cache: { old_info, def, personal_info: { name, number } },
      cookiesArr,
    }; //获取缓存信息并返回
  } else throw new Error('🙀浙大通行证登录失败');
};
export default login;
