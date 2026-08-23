import { ListSkeleton } from "@/components/list-skeleton";

export default function Loading() {
  return <ListSkeleton count={4} columns={2} />;
}
