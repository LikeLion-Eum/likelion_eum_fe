const KEY = "eum.editTokens";
const read = () => JSON.parse(localStorage.getItem(KEY) || "{}");
const write = (obj) => localStorage.setItem(KEY, JSON.stringify(obj));
export const saveEditToken = (resource, id, token) => {
    const data = read();
    if (!data[resource])
        data[resource] = {};
    data[resource][id] = token;
    write(data);
};
export const getEditToken = (resource, id) => read()[resource]?.[id];
export const removeEditToken = (resource, id) => {
    const data = read();
    if (data[resource]) {
        delete data[resource][id];
        write(data);
    }
};
