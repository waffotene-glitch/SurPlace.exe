import React from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function OnboardingIntroScreen({
  navigation,
  onSkip,
}: {
  navigation: any;
  onSkip: () => void;
}) {
  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1080&auto=format&fit=crop" }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.topSection}>
            <Text style={styles.brand}>SURPLACE</Text>
            <Pressable onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          <View style={styles.bottomSection}>
            <Text style={styles.title}>Proof, Not{"\n"}Promises.</Text>
            <Text style={styles.subtitle}>
              Stop trusting outdated photos.{"\n"}SurPlace is 100% live video{"\n"}reviews of the food.
            </Text>

            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate("OnboardingVisualMenus")}
            >
              <Text style={styles.buttonText}>Show Me More</Text>
            </Pressable>

            <View style={styles.paginationContainer}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)" },
  container: { flex: 1, justifyContent: "space-between", paddingHorizontal: 30, paddingBottom: 20 },
  topSection: {
    alignItems: "center",
    marginTop: 20,
  },
  brand: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 3 },
  skipButton: {
    position: "absolute",
    right: 0,
    top: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  bottomSection: { width: "100%", alignItems: "center" },
  title: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 55,
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
  paginationContainer: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 5,
  },
  activeDot: { width: 24, backgroundColor: "#FFFFFF" },
});
