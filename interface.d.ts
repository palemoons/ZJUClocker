export interface cacheProps {
  old_info: infoProps;
  def: infoProps;
  personal_info: {
    name: string;
    number: string;
  };
}

export interface loginProps {
  cache: cacheProps;
  cookiesArr: any[];
}

export interface pubKeyProps {
  modulus: string;
  exponent: number;
}

export interface infoProps {
  id?: number;
  name?: string;
  number?: string;
  date?: string;
  created?: number;
  gwszdd?: string;
  szgjcs?: string;
  'jrdqtlqk[]'?: number;
  'jrdqjcqk[]'?: number;
}
