export type Region = { si: string; gu?: string };

export type Post = {
  id: string;
  title: string;
  region?: Region;
  job?: string;
  techs?: string[];
  career?: string;
  headcount?: number;
  description?: string;
  isClosed?: boolean;
  createdAt?: string;
  deadlineAt?: string;
  views?: number;
  editToken?: string;
};

export type Profile = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isPublic: boolean;
  techs?: string[];
  career?: string;
  education?: string;
  region?: Region;
  portfolio?: string;
  editToken?: string;
};

export type Space = {
  id: string;
  name: string;
  description?: string;
  roomCount?: number;
  totalSize?: string | number;
  region?: Region;
  capacity?: number;
  facilities?: string[];
  imageUrl?: string;
  homepage?: string;
  address?: string;
  priceText?: string;
  lat?: number; lng?: number;
};

export type Program = {
  id: string;
  title: string;
  provider?: string;
  type?: string;
  region?: Region;
  benefits?: string;
  deadlineAt?: string;
  link?: string;
  space?: { id: string; name: string } | null;
};

export type Paginated<T> = { items: T[]; hasMore?: boolean; nextCursor?: string | null };
