import { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Mock vehicle data
const MOCK_VEHICLES = [
  {
    id: "1",
    name: "Tesla Model 3",
    code: "VH-2024",
    status: "active",
    driver: "John Smith",
    mileage: "45,230",
    lastService: "2 weeks ago",
    type: "Sedan",
    color: "#3b82f6",
  },
  {
    id: "2",
    name: "Honda Civic",
    code: "VH-2019",
    status: "maintenance",
    driver: "Unassigned",
    mileage: "78,450",
    lastService: "1 month ago",
    type: "Sedan",
    color: "#f59e0b",
  },
  {
    id: "3",
    name: "Ford Transit",
    code: "VH-2021",
    status: "active",
    driver: "Mike Johnson",
    mileage: "32,100",
    lastService: "1 week ago",
    type: "Van",
    color: "#10b981",
  },
  {
    id: "4",
    name: "Toyota Camry",
    code: "VH-2022",
    status: "idle",
    driver: "Unassigned",
    mileage: "12,340",
    lastService: "3 days ago",
    type: "Sedan",
    color: "#8b5cf6",
  },
  {
    id: "5",
    name: "Chevrolet Silverado",
    code: "VH-2020",
    status: "active",
    driver: "Sarah Williams",
    mileage: "65,890",
    lastService: "2 months ago",
    type: "Truck",
    color: "#ef4444",
  },
  {
    id: "6",
    name: "BMW X5",
    code: "VH-2023",
    status: "active",
    driver: "David Brown",
    mileage: "23,450",
    lastService: "5 days ago",
    type: "SUV",
    color: "#06b6d4",
  },
];

// Vehicle Card Component
function VehicleCard({ vehicle }: { vehicle: (typeof MOCK_VEHICLES)[0] }) {
  const router = useRouter();

  const statusConfig = {
    active: { label: "Active", color: "#10b981", bg: "#10b98120" },
    maintenance: { label: "Maintenance", color: "#f59e0b", bg: "#f59e0b20" },
    idle: { label: "Idle", color: "#6b7280", bg: "#6b728020" },
  };

  const status = statusConfig[vehicle.status as keyof typeof statusConfig];

  return (
    <Pressable
      className="bg-card border-border will-change-variable mb-3 rounded-xl border p-4 shadow-sm active:opacity-70"
      onPress={() => {}}
    >
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-foreground mb-1 text-lg font-bold">
            {vehicle.name}
          </Text>
          <Text className="text-muted-foreground text-sm">{vehicle.code}</Text>
        </View>
        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: status.bg }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: status.color }}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View className="will-change-variable mb-3 flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: vehicle.color + "20" }}
        >
          <Ionicons name="car" size={24} color={vehicle.color} />
        </View>
        <View className="flex-1">
          <View className="mb-1 flex-row items-center">
            <Ionicons name="person" size={14} color="#9ca3af" />
            <Text className="text-muted-foreground ml-1 text-xs">
              {vehicle.driver}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="speedometer" size={14} color="#9ca3af" />
            <Text className="text-muted-foreground ml-1 text-xs">
              {vehicle.mileage} miles
            </Text>
          </View>
        </View>
        <View>
          <Text className="text-muted-foreground text-right text-xs">
            Last Service
          </Text>
          <Text className="text-foreground text-right text-xs font-semibold">
            {vehicle.lastService}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <View className="bg-muted flex-1 rounded-lg px-3 py-2">
          <Text className="text-foreground text-center text-xs font-medium">
            {vehicle.type}
          </Text>
        </View>
        <Pressable className="bg-primary flex-1 items-center justify-center rounded-lg px-3 py-2">
          <Text className="text-primary-foreground text-xs font-semibold">
            View Details
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function VehiclesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filters = [
    { id: "all", label: "All", count: 6 },
    { id: "active", label: "Active", count: 3 },
    { id: "maintenance", label: "Maintenance", count: 1 },
    { id: "idle", label: "Idle", count: 1 },
  ];

  const filteredVehicles = MOCK_VEHICLES.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || vehicle.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView className="bg-background flex-1">
      <View>
        {/* Header Section */}
        <View className="px-6 py-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-foreground text-2xl font-bold">
                Vehicles
              </Text>
              <Text className="text-muted-foreground text-sm">
                {filteredVehicles.length} vehicles found
              </Text>
            </View>
            <Pressable className="bg-primary h-12 w-12 items-center justify-center rounded-full shadow-sm">
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View className="border-input bg-background mb-3 flex-row items-center rounded-lg border px-4 py-3">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              placeholder="Search vehicles..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-foreground ml-2 flex-1 text-base"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </Pressable>
            )}
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            {filters.map((filter) => (
              <Pressable
                key={filter.id}
                onPress={() => setSelectedFilter(filter.id)}
                className={`rounded-full px-4 py-2 ${
                  selectedFilter === filter.id
                    ? "bg-primary"
                    : "bg-card border-border border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedFilter === filter.id
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {filter.label} ({filter.count})
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Vehicle List */}
        <ScrollView className="px-6">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}

          {filteredVehicles.length === 0 && (
            <View className="items-center justify-center py-12">
              <Ionicons name="car-outline" size={64} color="#9ca3af" />
              <Text className="text-muted-foreground mt-4 text-center text-base">
                No vehicles found
              </Text>
              <Text className="text-muted-foreground mt-1 text-center text-sm">
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
