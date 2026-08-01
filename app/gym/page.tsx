import { PlaceholderPage } from "@/components/placeholder-page";

export default function GymPage() {
  return (
    <PlaceholderPage
      titleKey="gym.title"
      descriptionKey="gym.description"
      icon="dumbbell"
      itemKeys={["gym.item1", "gym.item2", "gym.item3", "gym.item4"]}
    />
  );
}
