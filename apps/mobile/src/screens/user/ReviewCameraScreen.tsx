import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { Button } from "../../components/AppUi";
import { useReviewDraft } from "../../context/ReviewDraftContext";

export function ReviewCameraScreen({ route, navigation }: { route: any; navigation: any }) {
  const cameraRef = useRef<CameraView | null>(null);
  const shouldDiscardRecordingRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { updateDraft } = useReviewDraft();
  const captureMode = route.params?.captureMode === "video" ? "video" : "image";
  const recordWithSound = route.params?.recordWithSound !== false;
  const shouldUseMicrophone = captureMode === "video" && recordWithSound;

  if (!permission) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>Loading camera permission...</Text>
      </View>
    );
  }

  if (shouldUseMicrophone && !microphonePermission) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>Loading microphone permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>Camera permission</Text>
        <Text style={styles.permissionBody}>
          Camera access is needed for live review capture.
        </Text>
        <Button label="Allow camera" onPress={() => void requestPermission()} />
      </View>
    );
  }

  if (shouldUseMicrophone && !microphonePermission?.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permissionTitle}>Microphone permission</Text>
        <Text style={styles.permissionBody}>
          Microphone access is needed to record a live review video with sound.
        </Text>
        <Button label="Allow microphone" onPress={() => void requestMicrophonePermission()} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
        mode={captureMode === "video" ? "video" : "picture"}
        mute={!recordWithSound}
        videoQuality={captureMode === "video" ? "480p" : undefined}
        videoBitrate={captureMode === "video" ? 1_200_000 : undefined}
      />

      <View style={styles.topBar}>
        <Pressable
          onPress={() => {
            if (captureMode === "video" && isRecording && cameraRef.current) {
              shouldDiscardRecordingRef.current = true;
              cameraRef.current.stopRecording();
              return;
            }

            navigation.goBack();
          }}
          style={styles.topButton}
        >
          <Text style={styles.topButtonText}>Close</Text>
        </Pressable>
      </View>

      <View style={styles.centerGuide}>
        <Text style={styles.guideTitle}>
          {captureMode === "video" ? "Record a live review clip" : "Capture a live review photo"}
        </Text>
        <Text style={styles.guideBody}>
          {captureMode === "video"
            ? recordWithSound
              ? "Keep the dish centered and speak naturally if you want audio."
              : "Keep the dish centered. This clip will be captured without audio."
            : "Frame the dish clearly before taking the shot."}
        </Text>
      </View>

      <View style={styles.bottomPanel}>
        <Text style={styles.bottomText}>
          {captureMode === "video"
            ? recordWithSound
              ? "Record one live review video with sound. It will upload only after review submission."
              : "Record one live review video without sound. It will upload only after review submission."
            : "Capture one live review photo. It will upload only after review submission."}
        </Text>

        {isRecording ? (
          <View style={styles.recordingBadge}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording...</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => {
            void (async () => {
              if (!cameraRef.current) {
                return;
              }

              if (captureMode === "video" && isRecording) {
                cameraRef.current.stopRecording();
                return;
              }

              setIsCapturing(true);
              try {
                if (captureMode === "video") {
                  setIsRecording(true);
                  const video = await cameraRef.current.recordAsync({
                    maxDuration: 10,
                    maxFileSize: 8 * 1024 * 1024,
                  });
                  if (!video?.uri) {
                    return;
                  }

                  if (shouldDiscardRecordingRef.current) {
                    shouldDiscardRecordingRef.current = false;
                    navigation.goBack();
                    return;
                  }

                  updateDraft({
                    capturedMediaUri: video.uri,
                    capturedMediaType: "video",
                  });
                  navigation.goBack();
                  return;
                }

                const photo = await cameraRef.current.takePictureAsync({
                  quality: 0.55,
                });
                if (!photo?.uri) {
                  return;
                }

                updateDraft({
                  capturedMediaUri: photo.uri,
                  capturedMediaType: "image",
                });
                navigation.goBack();
              } finally {
                shouldDiscardRecordingRef.current = false;
                setIsRecording(false);
                setIsCapturing(false);
              }
            })();
          }}
          disabled={isCapturing && !isRecording}
          style={[
            styles.captureButton,
            isRecording ? styles.captureButtonActive : undefined,
            isCapturing && !isRecording ? styles.captureButtonDisabled : undefined,
          ]}
        >
          <View style={styles.captureRing}>
            <View style={isRecording ? styles.captureStop : styles.captureCore} />
          </View>
        </Pressable>

        <Pressable
          onPress={() => {
            if (captureMode === "video" && isRecording && cameraRef.current) {
              shouldDiscardRecordingRef.current = true;
              cameraRef.current.stopRecording();
              return;
            }

            navigation.goBack();
          }}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: "#111111",
    justifyContent: "center",
    padding: 24,
  },
  permissionTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },
  permissionBody: {
    color: "#d4d4d8",
    lineHeight: 20,
    marginBottom: 16,
  },
  topBar: {
    position: "absolute",
    top: 54,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topButton: {
    borderRadius: 999,
    backgroundColor: "rgba(17,17,17,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  topButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  centerGuide: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  guideTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  guideBody: {
    color: "#e5e7eb",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 24,
    backgroundColor: "rgba(17,17,17,0.7)",
    padding: 18,
    alignItems: "center",
  },
  bottomText: {
    color: "#f3f4f6",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  recordingBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#3b0d0d",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginRight: 8,
  },
  recordingText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  captureButton: {
    marginBottom: 14,
  },
  captureButtonActive: {
    transform: [{ scale: 1.02 }],
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 4,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureCore: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#ef4444",
  },
  captureStop: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#ef4444",
  },
  cancelButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3f3f46",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#1a1a1a",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
