import { useGroceryStore } from "@/store/grocery-store";
import { useAuth } from "@clerk/expo";
import { Pressable, Text } from "react-native";

export default function ClearCompletedButton() {
  const { getToken } = useAuth();
  const { clearPurchased } = useGroceryStore();

  return (
    <Pressable
      className="rounded-2xl bg-primary py-3"
      onPress={async () => {
        const token = await getToken();
        clearPurchased(token);
      }}
    >
      <Text className="text-center text-base font-semibold text-primary-foreground">
        Clear completed items
      </Text>
    </Pressable>
  );
}
