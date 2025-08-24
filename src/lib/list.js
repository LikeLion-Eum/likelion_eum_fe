export function toList(data) {
    if (Array.isArray(data))
        return data;
    if (Array.isArray(data?.items))
        return data.items;
    if (Array.isArray(data?.data))
        return data.data;
    if (Array.isArray(data?.result))
        return data.result;
    if (Array.isArray(data?.results))
        return data.results;
    if (Array.isArray(data?.rows))
        return data.rows;
    if (Array.isArray(data?.content))
        return data.content;
    if (Array.isArray(data?.payload))
        return data.payload;
    if (Array.isArray(data?.list))
        return data.list;
    if (Array.isArray(data?.data?.items))
        return data.data.items;
    if (Array.isArray(data?.data?.list))
        return data.data.list;
    return [];
}
