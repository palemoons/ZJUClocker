import login from "./login.js";
import fetch from "node-fetch";
import { cacheProps, infoProps } from "./interface.js";
import { concatCookies } from "./utils/cookie.js";

const newForm = ({ old_info, def, personal_info }: cacheProps): infoProps => {
  let new_info: infoProps = JSON.parse("{}");
  Object.assign(new_info, old_info);
  new_info.id = def.id;
  new_info.name = personal_info.name;
  new_info.number = personal_info.number;
  new_info.date = new Date().toISOString().slice(0, 10).split("-").join("");
  new_info.created = Math.floor(new Date().valueOf() / 1000);
  new_info.gwszdd = "";
  new_info.szgjcs = "";
  new_info["jrdqjcqk[]"] = 0;
  new_info["jrdqtlqk[]"] = 0;
  return new_info;
};

const submitForm = async (info: infoProps, cookiesArr: any[]) => {
  const response = await fetch(
    "https://healthreport.zju.edu.cn/ncov/wap/default/save",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: concatCookies(cookiesArr),
      },
      body: JSON.stringify(info),
    }
  );
  console.log(await response.json());
};

(async () => {
  const { cache, cookiesArr } = await login();

  const new_info = newForm(cache);
  await submitForm(new_info, cookiesArr);
})();
