import React, { useCallback, useEffect, useState } from "react";
import { Image, Pressable, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Badge, Card, CardTitle, LoadingState, MediaPreview, Meta, Screen, Title } from "../../components/AppUi";
import { useReviewRefresh } from "../../context/ReviewRefreshContext";
import { getRestaurantDetails } from "../../services/appApi";
import { RestaurantDetailsResponse } from "../../types/api";
