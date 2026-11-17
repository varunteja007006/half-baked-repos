import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import AuthRequired from "~/components/auth-required";
import { authClient } from "~/utils/auth";

export default function DashboardScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Show loading state while checking session
  if (isPending) {
    return (
      <SafeAreaView className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </SafeAreaView>
    );
  }

  // Show login prompt if not authenticated
  if (!session?.user) {
    return <AuthRequired />;
  }

  return (
    <SafeAreaView className="bg-background">
      <ScrollView>
        {/* Header */}
        <View className="mb-8 px-6">
          <Text className="text-foreground text-3xl font-bold">
            Welcome Back{session.user.name ? `, ${session.user.name}` : ""}!
          </Text>
          <Text className="text-muted-foreground text-base">
            Here's what's happening with your fleet
          </Text>
          <Pressable
            className="bg-card mt-4 p-4 shadow-lg"
            onPress={() => {
              router.push("/org/join");
            }}
          >
            <Text className="text-center text-lg font-semibold">
              Join Organization
            </Text>
            <Text className="text-muted-foreground mt-2 text-center">
              Manage vehicles and trips.
            </Text>
          </Pressable>
          <Pressable
            className="bg-card mt-4 p-4 shadow-lg"
            onPress={() => {
              router.push("/org/create");
            }}
          >
            <Text className="text-center text-lg font-semibold">
              Create Organization
            </Text>
            <Text className="text-muted-foreground mt-2 text-center">
              Create a new organization for your fleet.
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
