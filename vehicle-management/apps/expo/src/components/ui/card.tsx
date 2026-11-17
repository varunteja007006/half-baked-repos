import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function Card({ children, className = "", onPress }: CardProps) {
  const Component = onPress ? Pressable : View;
  return (
    <Component
      onPress={onPress}
      className={`bg-card border-border rounded-xl border p-4 shadow-sm ${onPress ? "active:opacity-70" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  onPress?: () => void;
}

export function StatCard({
  icon,
  label,
  value,
  color,
  onPress,
}: StatCardProps) {
  return (
    <Card onPress={onPress} className="flex-1">
      <View
        className="mb-2 h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: color + "20" }}
      >
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text className="text-muted-foreground mb-1 text-xs font-medium uppercase">
        {label}
      </Text>
      <Text className="text-foreground text-2xl font-bold">{value}</Text>
    </Card>
  );
}

interface StatusBadgeProps {
  status: string;
  statusConfig: Record<
    string,
    { label: string; color: string; bg: string; icon?: string }
  >;
}

export function StatusBadge({ status, statusConfig }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <View
      className="flex-row items-center rounded-full px-3 py-1"
      style={{ backgroundColor: config.bg }}
    >
      {config.icon && (
        <Ionicons name={config.icon as any} size={14} color={config.color} />
      )}
      <Text
        className={`text-xs font-semibold ${config.icon ? "ml-1" : ""}`}
        style={{ color: config.color }}
      >
        {config.label}
      </Text>
    </View>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-12">
      <Ionicons name={icon as any} size={64} color="#9ca3af" />
      <Text className="text-foreground mt-4 text-center text-lg font-semibold">
        {title}
      </Text>
      <Text className="text-muted-foreground mt-1 text-center text-sm">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="bg-primary mt-6 rounded-lg px-6 py-3"
        >
          <Text className="text-primary-foreground text-sm font-semibold">
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
