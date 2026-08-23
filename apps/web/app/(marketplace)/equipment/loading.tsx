import { ListSkeleton } from "@/components/list-skeleton";

export default function Loading() {
  return <ListSkeleton count={6} columns={2} />;
}
