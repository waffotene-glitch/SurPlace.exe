import React, { useEffect, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { Video, ResizeMode } from "expo-av";
import * as Location from "expo-location";
import { Button, ErrorText, Field, Meta, PillGroup, Screen, Title } from "../../components/AppUi";
import { useAsyncTask } from "../../hooks/useAsyncTask";
import { useAuth } from "../../context/AuthContext";
import { useReviewDraft } from "../../context/ReviewDraftContext";
import { useReviewRefresh } from "../../context/ReviewRefreshContext";
import { ENFORCE_LOCATION_VERIFICATION } from "../../config/api";
import { createReview } from "../../services/appApi";
import { uploadReviewMedia } from "../../services/uploadApi";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}