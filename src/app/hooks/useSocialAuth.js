import { useSSO } from "@clerk/expo";
import { useState } from "react";
import { Alert } from "react-native";

const useSocialAuth = () => {
  const [loadingStrategy, setLoadingStrategy] = useState(null);
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async (strategy) => {
    if (loadingStrategy) return; // guard againts concurrent flows
    setLoadingStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (!createdSessionId || !setActive) {
        Alert.alert(
          "Sign-in incomplete",
          "Sign-in did not complete. Please try again.",
        );
        return;
      }
      await setActive({ session: createdSessionId });
    } catch (error) {
      console.log("💥 Error in social auth:", error);
      Alert.alert("Error", "Failed to sign in. Please try again.");
    } finally {
      setLoadingStrategy(null);
    }
  };
    return { handleSocialAuth, loadingStrategy };
};

export default useSocialAuth;
