import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Quick Stats Card Component

export function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View className="bg-card border-border flex-1 rounded-xl border p-4 shadow-sm">
      <View
        style={{
          backgroundColor: color + "20",
          width: 28,
          height: 28,
          marginBottom: 8,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text className="text-muted-foreground mb-1 text-xs font-medium uppercase">
        {label}
      </Text>
      <Text className="text-foreground text-2xl font-bold">{value}</Text>
    </View>
  );
}

// Action Button Component
export function ActionButton({
  icon,
  label,
  onPress,
  color,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-card border-border will-change-variable'> flex-1 items-center rounded-xl border p-4 shadow-sm active:opacity-70"
    >
      <View
        className="mb-2 h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: color + "20" }}
      >
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text className="text-foreground text-center text-sm font-medium">
        {label}
      </Text>
    </Pressable>
  );
}

// Recent Activity Item Component
export function ActivityItem({
  icon,
  title,
  subtitle,
  time,
  iconColor,
}: {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  iconColor: string;
}) {
  return (
    <View className="mb-3 flex-row items-center">
      <View
        className="mr-3 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: iconColor + "20" }}
      >
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground text-sm font-semibold">{title}</Text>
        <Text className="text-muted-foreground text-xs">{subtitle}</Text>
      </View>
      <Text className="text-muted-foreground text-xs">{time}</Text>
    </View>
  );
}

export function TotalVehiclesCard() {
  const color = "#f59e0b"; // gold color for vehicles
  return (
    <View className="bg-card border-border flex-1 rounded-xl border p-4 shadow-sm">
      <View
        style={{
          backgroundColor: color + "20",
          width: 28,
          height: 28,
          marginBottom: 8,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={"car"} size={24} color={color} />
      </View>
      <Text className="text-muted-foreground mb-1 text-xs font-medium uppercase">
        Total Vehicles
      </Text>
      <Text className="text-foreground text-2xl font-bold">24</Text>
    </View>
  );
}
