export const ITags = ["new", "offer", "trend"] as const

export type Tags = (typeof ITags)[number] // "new" | "offer" | "trend"

export const IDressTypes = [
  "saree",
  "chudidar",
  "salwar-suit",
  "kurti",
  "lehenga",
  "anarkali",
  "palazzo-set",
  "half-saree",
  "sharara",
  "gown",
  "patiala",
  "customized"
] as const;

export type DressType = (typeof IDressTypes)[number];

export interface IProductInput {
  title: string;
  description: string;
  price: number;
  images?: { publicId: string; url: string };
  tag: Tags;
  dressType: DressType;
  offer: boolean;
  stock: number;
  newPrice?: number;
}
