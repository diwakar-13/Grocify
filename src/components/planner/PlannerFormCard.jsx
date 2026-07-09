import { useGroceryStore } from "@/store/grocery-store";
import { useAuth } from "@clerk/expo";
import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const categories = ["Produce", "Dairy", "Bakery", "Pantry", "Snacks"];
const priorities = ["low", "medium", "high"];

const categoryIcons = {
  Produce: "leaf",
  Dairy: "cow",
  Bakery: "bread-slice",
  Pantry: "box-open",
  Snacks: "cookie-bite",
};

// ✅ Removed 'async' from the component definition
const PlannerFormCard = () => {
  const { getToken } = useAuth();
  const { error, addItem } = useGroceryStore();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("Produce");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = name.trim().length > 0 && !isSubmitting;

  const handleQuantityChange = (value) => {
    // Remove all non-numeric characters
    setQuantity(value.replace(/[^0-9]/g, ""));
  };

  const createItem = async () => {
    if (!canCreate) return;

    setIsSubmitting(true);

    // Safe fallback check for quantity
    const parsedQuantity = Math.max(1, Number(quantity));

    try {
      // ✅ Fetch the token safely inside the submit handler
      const token = await getToken();

      await addItem(
        {
          name: name.trim(),
          category,
          priority,
          quantity: parsedQuantity,
        },
        token,
      );

      // Reset form cleanly if successful
      setName("");
      setQuantity("1");
      setCategory("Produce");
      setPriority("medium");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="rounded-3xl border border-border bg-card p-4">
      {/* NAME */}
      <Text className="text-sm font-semibold text-foreground">Item name</Text>

      <View className="mt-2 flex-row items-center rounded-2xl border border-border bg-muted px-4 py-3">
        <FontAwesome6 name="bag-shopping" size={13} color="#5b7567" />

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ex: Blueberries"
          className="ml-3 flex-1 text-base text-foreground"
          placeholderTextColor="#8aa397"
          editable={!isSubmitting}
        />
      </View>

      {/* QUANTITY */}
      <Text className="mt-4 text-sm font-semibold text-foreground">
        Quantity
      </Text>

      <View className="mt-2 flex-row items-center rounded-2xl border border-border bg-muted px-4 py-3">
        <FontAwesome6 name="hashtag" size={13} color="#5b7567" />

        <TextInput
          value={quantity}
          onChangeText={handleQuantityChange}
          keyboardType="number-pad"
          placeholder="1"
          placeholderTextColor="#8aa397"
          className="ml-3 flex-1 text-base text-foreground"
          editable={!isSubmitting}
        />
      </View>

      {/* CATEGORY */}
      <Text className="mt-4 text-sm font-semibold text-foreground">
        Category
      </Text>

      <View className="mt-2 flex-row flex-wrap gap-2">
        {categories.map((option) => {
          const active = option === category;

          return (
            <Pressable
              key={option}
              onPress={() => !isSubmitting && setCategory(option)}
              className={`flex-row items-center rounded-full px-4 py-2 ${
                active ? "bg-primary" : "bg-secondary"
              } ${isSubmitting ? "opacity-60" : ""}`}
            >
              <FontAwesome6
                name={categoryIcons[option]}
                size={12}
                color={active ? "#fff" : "#486856"}
              />

              <Text
                className={`ml-2 text-sm font-semibold ${
                  active
                    ? "text-primary-foreground"
                    : "text-secondary-foreground"
                }`}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* PRIORITY */}
      <Text className="mt-4 text-sm font-semibold text-foreground">
        Priority
      </Text>

      <View className="mt-2 flex-row gap-2">
        {priorities.map((option) => {
          const active = option === priority;

          const icon =
            option === "high"
              ? "bolt"
              : option === "medium"
                ? "compass"
                : "seedling";

          return (
            <Pressable
              key={option}
              onPress={() => !isSubmitting && setPriority(option)}
              className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-2 ${
                active ? "bg-primary" : "bg-secondary"
              } ${isSubmitting ? "opacity-60" : ""}`}
            >
              <FontAwesome6
                name={icon}
                size={12}
                color={active ? "#ffffff" : "#486856"}
              />

              <Text
                className={`mt-1 text-sm font-semibold capitalize ${
                  active
                    ? "text-primary-foreground"
                    : "text-secondary-foreground"
                }`}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* SUBMIT BUTTON WITH LOADING */}
      <Pressable
        onPress={createItem}
        disabled={!canCreate}
        className={`mt-5 flex-row items-center justify-center rounded-2xl py-3 ${
          canCreate ? "bg-primary active:opacity-90" : "bg-muted"
        }`}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <FontAwesome6
            name="plus"
            size={14}
            color={canCreate ? "#ffffff" : "#7a9386"}
          />
        )}

        <Text
          className={`ml-2 text-base font-semibold ${
            canCreate ? "text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          {isSubmitting ? "Adding to Grocery List..." : "Add to Grocery List"}
        </Text>
      </Pressable>

      {/* ERROR FEEDBACK */}
      {error && (
        <View className="mt-3 rounded-2xl border border-destructive bg-red-500 px-3 py-2">
          <Text className="text-center text-sm uppercase text-white font-medium">
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PlannerFormCard;
