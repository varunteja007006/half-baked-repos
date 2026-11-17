import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  fullWidth = false,
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    outline: "bg-transparent border border-border",
    destructive: "bg-destructive",
    ghost: "bg-transparent",
  };

  const textVariantStyles = {
    primary: "text-primary-foreground",
    secondary: "text-secondary-foreground",
    outline: "text-foreground",
    destructive: "text-destructive-foreground",
    ghost: "text-foreground",
  };

  const sizeStyles = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`rounded-lg ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled || loading ? "opacity-50" : ""
      } ${fullWidth ? "w-full" : ""} ${className} active:opacity-70`}
    >
      <View className="flex-row items-center justify-center">
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#fff" : "#000"}
            className="mr-2"
          />
        )}
        <Text
          className={`${textVariantStyles[variant]} ${textSizeStyles[size]} text-center font-semibold`}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}
