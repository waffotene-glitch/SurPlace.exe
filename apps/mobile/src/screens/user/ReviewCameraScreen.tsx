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