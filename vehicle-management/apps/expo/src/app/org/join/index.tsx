import React from "react";
import { Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JoinOrg() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <SafeAreaView
      style={{
        backgroundColor: isDark ? "#FFFFFF" : "#FFFFFF",
        flex: 1,
      }}
    >
      <View>
        <Text>Hello World! 👋 🌍</Text>
      </View>
    </SafeAreaView>
  );
}
