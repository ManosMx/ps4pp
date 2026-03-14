export const POST_STATUSES = ["published", "pending", "rejected"] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_OPTIONS: Array<{
  value: PostStatus;
  label: string;
}> = [
  { value: "published", label: "Published" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];
