import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const SSOCallbackScreen = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    
    if (isSignedIn) {
      router.replace("/"); 
      return;
    }

    
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn]);

  
  useEffect(() => {
    if (timedOut && !isSignedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [timedOut, isSignedIn]);


  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
};

export default SSOCallbackScreen;