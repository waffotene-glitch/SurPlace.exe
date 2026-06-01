import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AVPlaybackStatus, ResizeMode, Video } from "expo-av";

const appColors = {
  background: "#f6f4ef",
  backgroundAlt: "#f9f7f2",
  surface: "#ffffff",
  surfaceMuted: "#f1ede5",
  border: "#ece7de",
  borderStrong: "#d4d0c8",
  text: "#1d1d1d",
  textMuted: "#5c5c5c",
  textSoft: "#7a7469",
  accent: "#f26b3a",
  accentDark: "#d45a2f",
  danger: "#a23d3d",
};

function VideoPreview({
  uri,
  height,
  fallbackText,
}: {
  uri: string;
  height: number;
  fallbackText: string;
}) {
  const videoRef = useRef<Video | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const togglePlayback = async () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);

    if (!videoRef.current) {
      return;
    }

    if (nextPaused) {
      await videoRef.current.pauseAsync();
      return;
    }

    await videoRef.current.playAsync();
  };

  return (
    <Pressable onPress={() => void togglePlayback()}>
      <View
        style={{
          width: "100%",
          height,
          borderRadius: 16,
          marginTop: 10,
          backgroundColor: "#111111",
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Video
          ref={videoRef}
          source={{ uri }}
          style={{
            width: "100%",
            height,
            opacity: isReady && !hasError ? 1 : 0.01,
          }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={!isPaused}
          isLooping
          isMuted
          useNativeControls={false}
          onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
            if (!status.isLoaded) {
              return;
            }

            setHasError(false);
            setIsReady(true);
            const nextPaused = !status.isPlaying;
            setIsPaused((current) => (current === nextPaused ? current : nextPaused));
          }}
          onError={() => {
            setHasError(true);
            setIsReady(false);
          }}
        />
        {!isReady && !hasError ? (
          <View style={{ position: "absolute", alignItems: "center" }}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={{ color: "#ffffff", marginTop: 8 }}>Loading media...</Text>
          </View>
        ) : null}
        {hasError ? (
          <Text style={{ color: "#ffffff", paddingHorizontal: 16, textAlign: "center" }}>
            {fallbackText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function ImagePreview({
  uri,
  height,
  fallbackText,
}: {
  uri: string;
  height: number;
  fallbackText: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View
      style={{
        width: "100%",
        height,
        borderRadius: 16,
        marginTop: 10,
        backgroundColor: "#ddd6ca",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={{ uri }}
        style={{
          width: "100%",
          height,
          opacity: !isLoading && !hasError ? 1 : 0.01,
        }}
        resizeMode="cover"
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
      {isLoading && !hasError ? (
        <View style={{ position: "absolute", alignItems: "center" }}>
          <ActivityIndicator size="small" color="#1f6f5f" />
          <Text style={{ color: "#5f5f5f", marginTop: 8 }}>Loading media...</Text>
        </View>
      ) : null}
      {hasError ? (
        <Text style={{ color: "#5f5f5f", paddingHorizontal: 16, textAlign: "center" }}>
          {fallbackText}
        </Text>
      ) : null}
    </View>
  );
}

export function Screen({
  children,
  scroll = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const content = (
    <View style={sharedStyles.screen}>{children}</View>
  );

  if (!scroll) {
    return content;
  }

  return (
    <ScrollView style={sharedStyles.scrollScreen} contentContainerStyle={sharedStyles.scrollContent}>
      {children}
    </ScrollView>
  );
}

export function Title({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: appColors.text }}>{children}</Text>
      {subtitle ? (
        <Text style={{ marginTop: 6, fontSize: 14, color: appColors.textMuted, lineHeight: 20 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ marginBottom: 6, color: "#3a3a3a", fontWeight: "700" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={{
          minHeight: multiline ? 100 : 48,
          borderWidth: 1,
          borderColor: appColors.borderStrong,
          borderRadius: 14,
          backgroundColor: appColors.surface,
          paddingHorizontal: 14,
          paddingVertical: 12,
          textAlignVertical: multiline ? "top" : "center",
          color: appColors.text,
        }}
      />
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const backgroundColor =
    variant === "secondary"
      ? appColors.surface
      : variant === "danger"
        ? appColors.danger
        : appColors.accent;
  const textColor = variant === "secondary" ? appColors.text : "#ffffff";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.6 : 1,
        backgroundColor,
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 16,
        alignItems: "center",
        marginBottom: 10,
        borderWidth: variant === "secondary" ? 1 : 0,
        borderColor: appColors.borderStrong,
        shadowColor: variant === "secondary" ? "transparent" : "#000000",
        shadowOpacity: variant === "secondary" ? 0 : 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: variant === "secondary" ? 0 : 2,
      }}
    >
      <Text style={{ color: textColor, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: appColors.surface,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: appColors.border,
        shadowColor: "#000000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 18, fontWeight: "700", color: "#232323" }}>{children}</Text>;
}

export function Meta({ children }: { children: React.ReactNode }) {
  return <Text style={{ marginTop: 4, color: "#5f5f5f", fontSize: 13 }}>{children}</Text>;
}

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const styles =
    tone === "success"
      ? { backgroundColor: "#e1f4ed", color: "#166c4e" }
      : tone === "warning"
        ? { backgroundColor: "#fff2d9", color: "#8a5b00" }
        : { backgroundColor: "#ece7de", color: "#45403a" };

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: styles.backgroundColor,
        marginTop: 8,
      }}
    >
      <Text style={{ color: styles.color, fontSize: 12, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

export function MediaPreview({
  uri,
  mediaType = "image",
  height = 200,
  fallbackText = "Review media is unavailable.",
}: {
  uri?: string;
  mediaType?: "image" | "video";
  height?: number;
  fallbackText?: string;
}) {
  if (!uri) {
    return <Meta>{fallbackText}</Meta>;
  }

  if (mediaType === "video") {
    return <VideoPreview uri={uri} height={height} fallbackText={fallbackText} />;
  }

  return <ImagePreview uri={uri} height={height} fallbackText={fallbackText} />;
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return <Text style={{ color: "#b03b3b", marginBottom: 12 }}>{message}</Text>;
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <View style={sharedStyles.loadingWrap}>
      <View style={sharedStyles.loadingCard}>
        <ActivityIndicator size="large" color={appColors.accent} />
        <Text style={sharedStyles.loadingTitle}>One moment</Text>
        <Text style={sharedStyles.loadingLabel}>{label}</Text>
      </View>
    </View>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <View style={sharedStyles.emptyCard}>
      <View style={sharedStyles.emptyAccent} />
      <Text style={sharedStyles.emptyTitle}>{title}</Text>
      <Text style={sharedStyles.emptyBody}>{body}</Text>
    </View>
  );
}

export function PillGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 999,
              backgroundColor: active ? "#1f6f5f" : "#ffffff",
              borderWidth: 1,
              borderColor: active ? "#1f6f5f" : "#d4d0c8",
            }}
          >
            <Text style={{ color: active ? "#ffffff" : "#202020", fontWeight: "600" }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 16,
  },
  scrollScreen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: appColors.backgroundAlt,
  },
  loadingCard: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 20,
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  loadingTitle: {
    marginTop: 14,
    color: appColors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  loadingLabel: {
    marginTop: 6,
    color: appColors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: appColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  emptyAccent: {
    width: 44,
    height: 6,
    borderRadius: 999,
    backgroundColor: appColors.accent,
    marginBottom: 12,
  },
  emptyTitle: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyBody: {
    color: appColors.textMuted,
    lineHeight: 20,
  },
});
