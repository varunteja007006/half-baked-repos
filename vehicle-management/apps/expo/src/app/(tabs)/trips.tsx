import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Mock trips data
const MOCK_TRIPS = [
  {
    id: "1",
    vehicle: "Tesla Model 3",
    vehicleCode: "VH-2024",
    driver: "John Smith",
    from: "San Francisco, CA",
    to: "Los Angeles, CA",
    distance: "382 mi",
    duration: "5h 45m",
    status: "completed",
    date: "Dec 12, 2025",
    time: "09:30 AM",
    cost: "$145.50",
  },
  {
    id: "2",
    vehicle: "Ford Transit",
    vehicleCode: "VH-2021",
    driver: "Mike Johnson",
    from: "Seattle, WA",
    to: "Portland, OR",
    distance: "173 mi",
    duration: "2h 50m",
    status: "active",
    date: "Dec 13, 2025",
    time: "10:15 AM",
    cost: "$68.20",
  },
  {
    id: "3",
    vehicle: "BMW X5",
    vehicleCode: "VH-2023",
    driver: "David Brown",
    from: "Boston, MA",
    to: "New York, NY",
    distance: "215 mi",
    duration: "3h 30m",
    status: "completed",
    date: "Dec 11, 2025",
    time: "08:00 AM",
    cost: "$92.75",
  },
  {
    id: "4",
    vehicle: "Chevrolet Silverado",
    vehicleCode: "VH-2020",
    driver: "Sarah Williams",
    from: "Austin, TX",
    to: "Houston, TX",
    distance: "165 mi",
    duration: "2h 30m",
    status: "scheduled",
    date: "Dec 14, 2025",
    time: "07:00 AM",
    cost: "$62.40",
  },
  {
    id: "5",
    vehicle: "Honda Civic",
    vehicleCode: "VH-2019",
    driver: "Unassigned",
    from: "Miami, FL",
    to: "Orlando, FL",
    distance: "235 mi",
    duration: "3h 30m",
    status: "cancelled",
    date: "Dec 10, 2025",
    time: "11:00 AM",
    cost: "$0.00",
  },
];

// Trip Card Component
function TripCard({ trip }: { trip: (typeof MOCK_TRIPS)[0] }) {
  const statusConfig = {
    active: {
      label: "In Progress",
      color: "#3b82f6",
      bg: "#3b82f620",
      icon: "navigate-circle",
    },
    completed: {
      label: "Completed",
      color: "#10b981",
      bg: "#10b98120",
      icon: "checkmark-circle",
    },
    scheduled: {
      label: "Scheduled",
      color: "#f59e0b",
      bg: "#f59e0b20",
      icon: "time",
    },
    cancelled: {
      label: "Cancelled",
      color: "#ef4444",
      bg: "#ef444420",
      icon: "close-circle",
    },
  };

  const status = statusConfig[trip.status as keyof typeof statusConfig];

  return (
    <Pressable className="bg-card border-border mb-3 rounded-xl border p-4 shadow-sm active:opacity-70">
      {/* Header */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <View className="mb-1 flex-row items-center">
            <Ionicons name="car" size={16} color="#9ca3af" />
            <Text className="text-foreground ml-1 text-base font-bold">
              {trip.vehicle}
            </Text>
          </View>
          <Text className="text-muted-foreground text-xs">
            {trip.vehicleCode} • {trip.driver}
          </Text>
        </View>
        <View
          className="flex-row items-center rounded-full px-3 py-1"
          style={{ backgroundColor: status.bg }}
        >
          <Ionicons name={status.icon as any} size={14} color={status.color} />
          <Text
            className="ml-1 text-xs font-semibold"
            style={{ color: status.color }}
          >
            {status.label}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View className="mb-3">
        <View className="mb-2 flex-row items-center">
          <View className="mr-3 items-center">
            <View className="h-3 w-3 rounded-full bg-green-500" />
            <View className="my-0.5 h-8 w-0.5 bg-gray-300" />
            <View className="h-3 w-3 rounded-full bg-red-500" />
          </View>
          <View className="flex-1">
            <View className="mb-1">
              <Text className="text-foreground text-sm font-semibold">
                {trip.from}
              </Text>
            </View>
            <View className="bg-border my-2 h-px" />
            <View>
              <Text className="text-foreground text-sm font-semibold">
                {trip.to}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Trip Details */}
      <View className="bg-muted mb-3 flex-row items-center justify-between rounded-lg p-3">
        <View className="flex-1 items-center">
          <Ionicons name="map-outline" size={18} color="#9ca3af" />
          <Text className="text-muted-foreground mt-1 text-xs">Distance</Text>
          <Text className="text-foreground text-sm font-semibold">
            {trip.distance}
          </Text>
        </View>
        <View className="bg-border h-10 w-px" />
        <View className="flex-1 items-center">
          <Ionicons name="time-outline" size={18} color="#9ca3af" />
          <Text className="text-muted-foreground mt-1 text-xs">Duration</Text>
          <Text className="text-foreground text-sm font-semibold">
            {trip.duration}
          </Text>
        </View>
        <View className="bg-border h-10 w-px" />
        <View className="flex-1 items-center">
          <Ionicons name="cash-outline" size={18} color="#9ca3af" />
          <Text className="text-muted-foreground mt-1 text-xs">Cost</Text>
          <Text className="text-foreground text-sm font-semibold">
            {trip.cost}
          </Text>
        </View>
      </View>

      {/* Date & Time */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
          <Text className="text-muted-foreground ml-1 text-xs">
            {trip.date} at {trip.time}
          </Text>
        </View>
        <Pressable>
          <Text className="text-primary text-xs font-semibold">
            View Details →
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function TripsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filters = [
    { id: "all", label: "All", count: 5 },
    { id: "active", label: "Active", count: 1 },
    { id: "completed", label: "Completed", count: 2 },
    { id: "scheduled", label: "Scheduled", count: 1 },
  ];

  const filteredTrips = MOCK_TRIPS.filter((trip) => {
    const matchesSearch =
      trip.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.to.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || trip.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView className="bg-background">
      <View>
        {/* Header Section */}
        <View className="px-6 py-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-foreground text-2xl font-bold">Trips</Text>
              <Text className="text-muted-foreground text-sm">
                {filteredTrips.length} trips found
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
              placeholder="Search trips..."
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

        {/* Trips List */}
        <ScrollView className="px-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}

          {filteredTrips.length === 0 && (
            <View className="items-center justify-center py-12">
              <Ionicons name="map-outline" size={64} color="#9ca3af" />
              <Text className="text-muted-foreground mt-4 text-center text-base">
                No trips found
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
