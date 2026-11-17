import { Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad";
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
}: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-foreground mb-2 text-sm font-medium">
          {label}
        </Text>
      )}
      <View
        className={`border-input bg-background flex-row items-center rounded-lg border px-4 ${
          multiline ? "py-3" : "py-3.5"
        } ${error ? "border-destructive" : ""} ${!editable ? "opacity-50" : ""}`}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color="#9ca3af"
            className="mr-2"
          />
        )}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          className={`text-foreground flex-1 text-base ${icon ? "ml-2" : ""}`}
        />
      </View>
      {error && <Text className="text-destructive mt-1 text-xs">{error}</Text>}
    </View>
  );
}
