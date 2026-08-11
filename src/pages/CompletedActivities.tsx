import { ActivityListView } from "@/components/activities/ActivityListView";

const CompletedActivities = () => (
  <ActivityListView
    mode="completed"
    title="Completed activities"
    description="Activities already completed. Reopen or delete."
  />
);

export default CompletedActivities;