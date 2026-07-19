import UserCard from "../../../components/UserCard";
import { getDashboardSummaryAction } from "../../../actions/dashboard";

const AdminPage = async () => {
  const response = await getDashboardSummaryAction();

  if (response.error || !response.data) {
    return (
      <div className="p-4">
        <p className="text-red-600 text-sm">
          Failed to load dashboard summary: {response.message}
        </p>
      </div>
    );
  }

  const { mentorCount, menteeCount, completedSessionCount } = response.data;

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="Mentors" count={mentorCount} />
          <UserCard type="Mentees" count={menteeCount} />
          <UserCard type="Completed Sessions" count={completedSessionCount} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
