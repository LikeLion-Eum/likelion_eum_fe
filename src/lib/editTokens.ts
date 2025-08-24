type TokenBucket = Record<string, Record<string, string>>;
const KEY = "eum.editTokens";

const read = (): TokenBucket => JSON.parse(localStorage.getItem(KEY) || "{}");
const write = (obj: TokenBucket) => localStorage.setItem(KEY, JSON.stringify(obj));

export const saveEditToken = (resource: string, id: string, token: string) => {
  const data = read();
  if (!data[resource]) data[resource] = {};
  data[resource][id] = token; write(data);
};
export const getEditToken = (resource: string, id: string) => read()[resource]?.[id];
export const removeEditToken = (resource: string, id: string) => {
  const data = read(); if (data[resource]) { delete data[resource][id]; write(data); }
};
