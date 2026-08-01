import { PageHeader } from "@/components/page-header";
import { ProfileView } from "@/components/profile-view";
import { T } from "@/components/translate";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="user"
        title={<T id="profile.title" />}
        subtitle={<T id="profile.subtitle" />}
      />

      <ProfileView />
    </div>
  );
}
