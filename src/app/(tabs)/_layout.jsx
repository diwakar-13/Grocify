import { useGroceryStore } from "@/store/grocery-store";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";

export default function Layout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { colorScheme } = useColorScheme();
  const { loadItems, items } = useGroceryStore();
  const isDark = colorScheme === "dark";
  const tabTintColor = isDark ? "hsl(142 70% 54%)" : "hsl(147 75% 33%)";

  useEffect(() => {
    loadItems();
  }, []);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <NativeTabs
      tintColor={tabTintColor}
      // Android aur iOS dono par accurate container structure dene ke liye class use karein
      className="bg-card dark:bg-background border-t border-border/40"
    >
      {/* List Tab */}
      <NativeTabs.Trigger
        name="index"
        className="flex-1 items-center justify-center py-2 min-h-[56px]"
      >
        <NativeTabs.Trigger.Icon
          sf={{
            default: "list.bullet.clipboard",
            selected: "list.bullet.clipboard.fill",
          }}
          md="list"
        />
        <NativeTabs.Trigger.Label className="text-[11px] font-medium tracking-wide mt-0.5">
          List
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Planner Tab */}
      <NativeTabs.Trigger
        name="planner"
        className="flex-1 items-center justify-center py-2 min-h-[56px]"
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
          md="add"
        />
        <NativeTabs.Trigger.Label className="text-[11px] font-medium tracking-wide mt-0.5">
          Planner
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Insights Tab */}
      <NativeTabs.Trigger
        name="insights"
        className="flex-1 items-center justify-center py-2 min-h-[56px]"
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          md="analytics"
        />
        <NativeTabs.Trigger.Label className="text-[11px] font-medium tracking-wide mt-0.5">
          Insights
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
