import { useGroceryStore } from "@/store/grocery-store";
import { useAuth } from "@clerk/expo";
import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

// ✅ FIX 1: Component ab normal synchronous function hai
const CompletedItems = () => {
  const { getToken } = useAuth();
  const { removeItem, togglePurchased, items } = useGroceryStore();
  
  const completedItems = items.filter((item) => item.purchased);

  if (!completedItems.length) return null;

  return (
    <View className="mt-3 rounded-3xl border border-border bg-secondary p-4">
      <Text className="text-sm font-semibold uppercase tracking-[1px] text-secondary-foreground">
        Completed
      </Text>

      {completedItems.map((item) => (
        <View
          key={item.id}
          className="mt-3 flex-row items-center justify-between rounded-2xl border border-border bg-card px-3 py-2"
        >
          <View className="flex-row items-center gap-2">
            <Pressable
              // ✅ FIX 2: Token ab click hone par dynamic niklega, render body mein nahi!
              onPress={async () => {
                const token = await getToken();
                togglePurchased(item.id, token);
              }}
              className="h-6 w-6 items-center justify-center rounded-full bg-primary"
            >
              <FontAwesome6 name="check" size={12} color="#ffffff" />
            </Pressable>
            <Text className="text-base text-muted-foreground line-through">
              {item.name}
            </Text>
          </View>

          <Pressable
            // ✅ FIX 3: Same yahan bhi token click event par nikalega
            onPress={async () => {
              const token = await getToken();
              removeItem(item.id, token);
            }}
            className="h-8 w-8 items-center justify-center rounded-xl bg-destructive"
          >
            <FontAwesome6 name="trash" size={12} color="#ffffff" />
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default CompletedItems;