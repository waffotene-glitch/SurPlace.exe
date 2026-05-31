import React, { useRef, useState } from "react";
import { Text, View } from "react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { Button, Screen, Title } from "../../components/AppUi";
import { useReviewDraft } from "../../context/ReviewDraftContext";
