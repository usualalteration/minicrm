import { ActivityListView } from "@/components/activities/ActivityListView";

const PendingActivities = () => (
  <ActivityListView
    mode="pending"
    title="Pending activities"
    description="Activities still to be done. Mark complete, postpone or delete."
  />
);

export default PendingActivities;