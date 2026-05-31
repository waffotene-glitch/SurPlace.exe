import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Card, Field, LoadingState, Meta, Screen, Title } from "../../components/AppUi";
import { getPlates, getRestaurants } from "../../services/appApi";
import { Plate, Restaurant } from "../../types/api";