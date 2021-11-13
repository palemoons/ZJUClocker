import login from './login.js';
import axios from 'axios';
import { cacheProps, infoProps } from './interface.js';
import { concatCookies } from './utils/cookie.js';

const newForm = ({ old_info, def, personal_info }: cacheProps): infoProps => {
  let new_info: infoProps = JSON.parse('{}');
  Object.assign(new_info, old_info);
  new_info.id = def.id;
  new_info.name = personal_info.name;
  new_info.number = personal_info.number;
  new_info.date = new Date().toISOString().slice(0, 10).split('-').join('');
  new_info.created = Math.floor(new Date().valueOf() / 1000);
  new_info.gwszdd = '';
  new_info.szgjcs = '';
  new_info['jrdqjcqk[]'] = 0;
  new_info['jrdqtlqk[]'] = 0;
  new_info.gwszdd = '';
  new_info.szgjcs = '';
  return new_info;
};

const submitForm = async (
  info: infoProps,
  cookiesArr: any[]
): Promise<string> => {
  const http = axios.create();
  const data = new URLSearchParams(info as Record<string, string>);

  const response = await http({
    url: 'https://healthreport.zju.edu.cn/ncov/wap/default/save',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: concatCookies(cookiesArr),
    },
    data: data,
  });
  console.log('😸', response.data.m);
  return response.data.m;
};

const clocker = async (): Promise<string> => {
  const { cache, cookiesArr } = await login();
  const new_info = newForm(cache);
  return await submitForm(new_info, cookiesArr);
};

clocker();
