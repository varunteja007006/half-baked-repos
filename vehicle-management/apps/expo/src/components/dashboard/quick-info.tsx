import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ActionButton, ActivityItem, StatCard } from "./stats-card";

const QuickInfo = () => {
  const router = useRouter();
  return (
    <>
      {/* Quick Stats */}
      <View className="mb-6 flex-row gap-3 px-6">
        <StatCard
          icon="car"
          label="Total Vehicles"
          value="24"
          color="#f59e0b"
        />
        <StatCard
          icon="location"
          label="Active Trips"
          value="8"
          color="#3b82f6"
        />
      </View>

      <View className="mb-6 flex-row gap-3 px-6">
        <StatCard
          icon="speedometer"
          label="Total Miles"
          value="1.2K"
          color="#10b981"
        />
        <StatCard
          icon="alert-circle"
          label="Alerts"
          value="3"
          color="#ef4444"
        />
      </View>

      {/* Quick Actions */}
      <View className="mb-6 px-6">
        <Text className="text-foreground mb-3 text-lg font-semibold">
          Quick Actions
        </Text>
        <View className="flex-row gap-3">
          <ActionButton
            icon="add-circle"
            label="Add Vehicle"
            onPress={() => router.push("/vehicles")}
            color="#f59e0b"
          />
          <ActionButton
            icon="navigate"
            label="Start Trip"
            onPress={() => router.push("/trips")}
            color="#3b82f6"
          />
          <ActionButton
            icon="document-text"
            label="Reports"
            onPress={() => {}}
            color="#8b5cf6"
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View className="mb-6 px-6">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-foreground text-lg font-semibold">
            Recent Activity
          </Text>
          <Pressable>
            <Text className="text-primary text-sm font-medium">View All</Text>
          </Pressable>
        </View>

        <View className="bg-card border-border rounded-xl border p-4 shadow-sm">
          <ActivityItem
            icon="car"
            title="Vehicle Added"
            subtitle="Tesla Model 3 #VH-2024"
            time="2h ago"
            iconColor="#f59e0b"
          />
          <ActivityItem
            icon="checkmark-circle"
            title="Trip Completed"
            subtitle="San Francisco → Los Angeles"
            time="5h ago"
            iconColor="#10b981"
          />
          <ActivityItem
            icon="warning"
            title="Maintenance Due"
            subtitle="Honda Civic #VH-2019"
            time="1d ago"
            iconColor="#ef4444"
          />
          <ActivityItem
            icon="person-add"
            title="Driver Onboarded"
            subtitle="John Smith"
            time="2d ago"
            iconColor="#3b82f6"
          />
        </View>
      </View>

      {/* Fleet Status Overview */}
      <View className="mb-6 px-6">
        <Text className="text-foreground mb-3 text-lg font-semibold">
          Fleet Status
        </Text>
        <View className="bg-card border-border rounded-xl border p-4 shadow-sm">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-2 h-3 w-3 rounded-full bg-green-500" />
              <Text className="text-foreground text-sm">Active</Text>
            </View>
            <Text className="text-foreground text-sm font-semibold">
              18 vehicles
            </Text>
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-2 h-3 w-3 rounded-full bg-yellow-500" />
              <Text className="text-foreground text-sm">In Maintenance</Text>
            </View>
            <Text className="text-foreground text-sm font-semibold">
              4 vehicles
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-2 h-3 w-3 rounded-full bg-gray-400" />
              <Text className="text-foreground text-sm">Idle</Text>
            </View>
            <Text className="text-foreground text-sm font-semibold">
              2 vehicles
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};

export default QuickInfo;

const styles = StyleSheet.create({});
