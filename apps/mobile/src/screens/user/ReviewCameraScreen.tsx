import React, { useRef, useState } from "react";
import { Text, View } from "react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { Button, Screen, Title } from "../../components/AppUi";
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

    if (!permission) {
    return (
      <Screen>
        <Title>Loading camera permission...</Title>
      </Screen>
    );
  }

  if (captureMode === "video" && !microphonePermission) {
    return (
      <Screen>
        <Title>Loading microphone permission...</Title>
      </Screen>
    );
  }
  
  if (!permission.granted) {
    return (
      <Screen>
        <Title subtitle="Camera access is needed for live review capture.">Camera Permission</Title>
        <Button label="Allow camera" onPress={() => void requestPermission()} />
      </Screen>
    );
  }

  if (captureMode === "video" && !microphonePermission?.granted) {
    return (
      <Screen>
        <Title subtitle="Microphone access is needed to record a live review video.">
          Microphone Permission
        </Title>
        <Button label="Allow microphone" onPress={() => void requestMicrophonePermission()} />
      </Screen>
    );
  }

  
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        ref={cameraRef}
        mode={captureMode === "video" ? "video" : "picture"}
        mute={false}
        videoQuality={captureMode === "video" ? "480p" : undefined}
      />
      <View style={{ padding: 16, backgroundColor: "#111111" }}>
        <Text style={{ color: "#ffffff", marginBottom: 12 }}>
          {captureMode === "video"
            ? "Record one live review video. It will be uploaded only after you submit the review."
            : "Capture one live review photo. It will be uploaded only after you submit the review."}
        </Text>

         <Button
          label={
            captureMode === "video"
              ? isRecording
                ? "Stop recording"
                : isCapturing
                  ? "Preparing video..."
                  : "Start recording"
              : isCapturing
                ? "Capturing..."
                : "Capture photo"
          }
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
                  const video = await cameraRef.current.recordAsync({ maxDuration: 10 });
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

                const photo = await cameraRef.current.takePictureAsync();
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
        />
        <Button
          label="Cancel"
          variant="secondary"
          onPress={() => {
            if (captureMode === "video" && isRecording && cameraRef.current) {
              shouldDiscardRecordingRef.current = true;
              cameraRef.current.stopRecording();
              return;
            }

            navigation.goBack();
          }}
        />
      </View>
    </View>
  );
}
