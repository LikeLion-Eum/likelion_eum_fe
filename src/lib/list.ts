export function toList<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data?.items)) return data.items as T[];
  if (Array.isArray(data?.data)) return data.data as T[];
  if (Array.isArray(data?.result)) return data.result as T[];
  if (Array.isArray(data?.results)) return data.results as T[];
  if (Array.isArray(data?.rows)) return data.rows as T[];
  if (Array.isArray(data?.content)) return data.content as T[];
  if (Array.isArray(data?.payload)) return data.payload as T[];
  if (Array.isArray(data?.list)) return data.list as T[];
  if (Array.isArray(data?.data?.items)) return data.data.items as T[];
  if (Array.isArray(data?.data?.list)) return data.data.list as T[];
  return [];
}
