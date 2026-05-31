import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Badge, Card, CardTitle, LoadingState, MediaPreview, Meta, Screen, Title } from "../../components/AppUi";
import { useReviewRefresh } from "../../context/ReviewRefreshContext";
import { getPlateDetails } from "../../services/appApi";
import { PlateDetailsResponse } from "../../types/api";