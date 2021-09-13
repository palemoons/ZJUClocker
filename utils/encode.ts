import bigInt from "big-integer";

const encode = async (str: string, m: string, e: number) => {
  const hex: string = Buffer.from(str, "utf-8").toString("hex");
  const M = bigInt(m, 16);
  const H = bigInt(hex, 16);
  const E = bigInt(e.toString(), 16);
  
  const result = H.modPow(E, M);
  return result.toString(16);
};

export default encode;
