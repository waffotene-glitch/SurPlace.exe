import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Badge, EmptyState, MediaPreview } from "../../components/AppUi";
import { useAuth } from "../../context/AuthContext";
import { getManagerDashboard, getManagerReviews } from "../../services/appApi";
import { ManagerDashboard, Review } from "../../types/api";
import {
