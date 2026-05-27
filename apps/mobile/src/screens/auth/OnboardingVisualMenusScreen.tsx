import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const IMAGE_HEIGHT = height * 0.4;

export function OnboardingVisualMenusScreen({
  navigation,
  onComplete,
}: {
  navigation: any;
  onComplete: () => void;
}) {
  const translateY = useRef(new Animated.Value(0)).current;

  const images = [
    "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
  ];

  useEffect(() => {
    const startAnimation = () => {
      translateY.setValue(0);
      Animated.timing(translateY, {
        toValue: -(IMAGE_HEIGHT * 3),
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          startAnimation();
        }
      });
    };

    startAnimation();
  }, [translateY]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.animatedBackground, { transform: [{ translateY }] }]}>
        {[...images, ...images].map((img, index) => (
          <Image key={index} source={{ uri: img }} style={styles.bgImage} />
        ))}
      </Animated.View>

      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </Pressable>
            <Pressable onPress={onComplete} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          <View style={styles.spacer} />

          <View style={styles.bottomContent}>
            <Text style={styles.title}>Visual Menus.</Text>
            <Text style={styles.subtitle}>What does it look like.Before you sit down.</Text>

            <Pressable style={styles.button} onPress={onComplete}>
              <Text style={styles.buttonText}>Got It</Text>
            </Pressable>

            <View style={styles.paginationContainer}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.activeDot]} />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  animatedBackground: { position: "absolute", width, height: IMAGE_HEIGHT * 6 },
  bgImage: { width, height: IMAGE_HEIGHT, resizeMode: "cover" },
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.55)" },
  safeArea: { flex: 1, justifyContent: "space-between" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { padding: 5 },
  skipButton: { paddingHorizontal: 8, paddingVertical: 4 },
  skipText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  spacer: { flex: 1 },
  bottomContent: { paddingHorizontal: 30, paddingBottom: 40, alignItems: "center" },
  title: {
    color: "#FFFFFF",
    fontSize: 44,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 40,
  },
  buttonText: { color: "#001E36", fontSize: 18, fontWeight: "700" },
  paginationContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 5,
  },
  activeDot: { width: 24, backgroundColor: "#FFFFFF" },
});
