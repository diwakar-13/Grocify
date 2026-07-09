import { useGroceryStore } from "@/store/grocery-store";
import { useAuth } from "@clerk/expo";
import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

const priorityPillBg = {
  low: "bg-priority-low",
  medium: "bg-priority-medium",
  high: "bg-priority-high",
};

const priorityPillText = {
  low: "text-priority-low-foreground",
  medium: "text-priority-medium-foreground",
  high: "text-priority-high-foreground",
};

// ✅ FIX 1: Component ko standard synchronous function banaya
const PendingItemCard = ({ item }) => {
  const { getToken } = useAuth();
  const { removeItem, updateQuantity, togglePurchased } = useGroceryStore();

  return (
    <View className="rounded-3xl border border-border bg-card p-4">
      <View className="flex-row items-start gap-3">
        
        {/* Toggle Purchased Checkbox */}
        <Pressable
          className="mt-1 size-6 items-center justify-center rounded-full border-2 border-border bg-card"
          // ✅ FIX 2: Token ab click hone par dynamic niklega
          onPress={async () => {
            const token = await getToken();
            togglePurchased(item.id, token);
          }}
        />

        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-lg font-semibold text-card-foreground">
              {item.name}
            </Text>
            <View
              className={`rounded-full px-3 py-1 ${priorityPillBg[item.priority]}`}
            >
              <Text
                className={`text-xs font-bold uppercase ${priorityPillText[item.priority]}`}
              >
                {item.priority}
              </Text>
            </View>
          </View>

          <View className="mt-2 flex-row items-center gap-2">
            <View className="rounded-full bg-secondary px-3 py-1">
              <Text className="text-xs font-semibold text-secondary-foreground">
                {item.category}
              </Text>
            </View>
          </View>

          {/* Quantity Controls */}
          <View className="mt-3 flex-row items-center gap-2">
            {/* Minus Button */}
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-xl border border-border bg-muted"
              // ✅ FIX 3: Token click handler ke andar bhej diya
              onPress={async () => {
                const token = await getToken();
                updateQuantity(item.id, Math.max(1, item.quantity - 1), token);
              }}
            >
              <FontAwesome6 name="minus" size={12} color="#3b5a4a" />
            </Pressable>

            <Text className="min-w-9 text-center text-base font-semibold text-foreground">
              {item.quantity}
            </Text>

            {/* Plus Button */}
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-xl border border-border bg-muted"
              // ✅ FIX 4: Same yahan bhi token block click par hai
              onPress={async () => {
                const token = await getToken();
                updateQuantity(item.id, item.quantity + 1, token);
              }}
            >
              <FontAwesome6 name="plus" size={12} color="#3b5a4a" />
            </Pressable>
          </View>
        </View>

        {/* Delete Button */}
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-xl bg-red-500"
          // ✅ FIX 5: Trash click par secure token pass
          onPress={async () => {
            const token = await getToken();
            removeItem(item.id, token);
          }}
        >
          <FontAwesome6 name="trash" size={13} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
};

export default PendingItemCard;