import { View } from "react-native";
import { UserButton } from '@clerk/expo/native'
const insights = () => {
  return (
    <View className="flex-1 items-center justify-center">
     <UserButton />
    </View>
  );
};

export default insights;
