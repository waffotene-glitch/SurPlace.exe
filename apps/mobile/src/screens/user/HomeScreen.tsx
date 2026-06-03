import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getPlates, getRestaurants } from "../../services/appApi";
import { EmptyState, LoadingState } from "../../components/AppUi";
import { Plate, Restaurant } from "../../types/api";

const HOME_ACCENT = "#f26b3a";
const HOME_MUTED = "#6b7280";
const HOME_BG = "#fff8f3";

export function HomeScreen({ navigation }: { navigation: any }) {
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCuisine, setActiveCuisine] = useState("All");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [restaurantResponse, plateResponse] = await Promise.all([
          getRestaurants(),
          getPlates(),
        ]);
        setRestaurants(restaurantResponse.items);
        setPlates(plateResponse.items);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const restaurantNameById = useMemo(
    () => Object.fromEntries(restaurants.map((restaurant) => [restaurant.id, restaurant.name])),
    [restaurants]
  );

  const cuisineOptions = useMemo(() => {
    const tags = restaurants.flatMap((restaurant) => restaurant.cuisineTags ?? []).filter(Boolean);
    return ["All", ...Array.from(new Set(tags)).slice(0, 5)];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    const q = search.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const matchesSearch =
        !q ||
        [restaurant.name, restaurant.description, restaurant.location.address]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const matchesCuisine =
        activeCuisine === "All" || restaurant.cuisineTags?.includes(activeCuisine);
      return matchesSearch && matchesCuisine;
    });
  }, [activeCuisine, restaurants, search]);

  const filteredPlates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return plates.filter((plate) => {
      const restaurantName = restaurantNameById[plate.restaurant] || "";
      return (
        !q ||
        [plate.name, plate.description, restaurantName].join(" ").toLowerCase().includes(q)
      );
    });
  }, [plates, restaurantNameById, search]);

  const featuredRestaurants = useMemo(
    () =>
      [...filteredRestaurants]
        .sort((first, second) => second.averageRating - first.averageRating)
        .slice(0, 6),
    [filteredRestaurants]
  );

  const localFavorites = useMemo(
    () =>
      [...filteredRestaurants]
        .sort((first, second) => second.totalReviews - first.totalReviews)
        .slice(0, 5),
    [filteredRestaurants]
  );

  const featuredPlates = useMemo(
    () =>
      [...filteredPlates]
        .sort((first, second) => second.averageRating - first.averageRating)
        .slice(0, 8),
    [filteredPlates]
  );

  if (isLoading) {
    return <LoadingState label="Loading nearby restaurants and plates..." />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Discover</Text>
        <Text style={styles.heroTitle}>Find great food near you</Text>
        <View style={styles.searchShell}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Maison du Piment or Grilled Fish"
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineRow}
      >
        {cuisineOptions.map((option) => {
          const isActive = option === activeCuisine;
          return (
            <Pressable
              key={option}
              onPress={() => setActiveCuisine(option)}
              style={[styles.cuisineChip, isActive && styles.cuisineChipActive]}
            >
              <Text style={[styles.cuisineChipText, isActive && styles.cuisineChipTextActive]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Top rated near you</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredRow}
      >
        {featuredRestaurants.map((restaurant) => (
          <Pressable
            key={restaurant.id}
            onPress={() =>
              navigation.navigate("RestaurantDetails", {
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
              })
            }
            style={styles.featuredCard}
          >
            {restaurant.coverImageUrl ? (
              <Image source={{ uri: restaurant.coverImageUrl }} style={styles.featuredImage} />
            ) : (
              <View style={[styles.featuredImage, styles.featuredImageFallback]} />
            )}
            <View style={styles.featuredRating}>
              <Text style={styles.featuredRatingText}>
                {restaurant.averageRating.toFixed(1)} / 5
              </Text>
            </View>
            <Text style={styles.featuredName}>{restaurant.name}</Text>
            <Text numberOfLines={1} style={styles.featuredMeta}>
              {restaurant.location.address}
            </Text>
            <Text style={styles.featuredMeta}>{restaurant.totalReviews} reviews</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Local favorites</Text>
          <Text style={styles.sectionSubtitle}>Loved by nearby diners</Text>
        </View>
      </View>

      <View style={styles.listColumn}>
        {localFavorites.map((restaurant) => (
          <Pressable
            key={restaurant.id}
            onPress={() =>
              navigation.navigate("RestaurantDetails", {
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
              })
            }
            style={styles.favoriteCard}
          >
            {restaurant.coverImageUrl ? (
              <Image source={{ uri: restaurant.coverImageUrl }} style={styles.favoriteImage} />
            ) : (
              <View style={[styles.favoriteImage, styles.featuredImageFallback]} />
            )}
            <View style={styles.favoriteBody}>
              <View style={styles.favoriteTopRow}>
                <Text numberOfLines={1} style={styles.favoriteName}>
                  {restaurant.name}
                </Text>
                <View style={styles.favoriteBadge}>
                  <Text style={styles.favoriteBadgeText}>{restaurant.totalReviews}</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.favoriteAddress}>
                {restaurant.location.address}
              </Text>
              <Text numberOfLines={2} style={styles.favoriteDescription}>
                {restaurant.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Best plates to try</Text>
          <Text style={styles.sectionSubtitle}>Popular dishes to explore</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredRow}
      >
        {featuredPlates.map((plate) => (
          <Pressable
            key={plate.id}
            onPress={() =>
              navigation.navigate("PlateDetails", {
                plateId: plate.id,
                plateName: plate.name,
                restaurantId: plate.restaurant,
                restaurantName: restaurantNameById[plate.restaurant],
              })
            }
            style={styles.plateCard}
          >
            {plate.imageUrl ? (
              <Image source={{ uri: plate.imageUrl }} style={styles.plateImage} />
            ) : (
              <View style={[styles.plateImage, styles.featuredImageFallback]} />
            )}
            <Text numberOfLines={1} style={styles.plateName}>
              {plate.name}
            </Text>
            <Text numberOfLines={1} style={styles.plateRestaurant}>
              {restaurantNameById[plate.restaurant] || "Restaurant"}
            </Text>
            <Text style={styles.plateMeta}>
              {plate.averageRating.toFixed(1)} / 5 · {plate.totalReviews} reviews
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {!filteredRestaurants.length && !filteredPlates.length ? (
        <EmptyState
          title="No matches found"
          body="Try a different search term or switch back to the All cuisine filter."
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: HOME_BG,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: "#1f1f1f",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  eyebrow: {
    color: "#f7c3ae",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  searchShell: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  searchInput: {
    fontSize: 16,
    color: "#111827",
    paddingVertical: 8,
  },
  cuisineRow: {
    paddingBottom: 8,
  },
  cuisineChip: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#f1dfd5",
  },
  cuisineChipActive: {
    backgroundColor: HOME_ACCENT,
    borderColor: HOME_ACCENT,
  },
  cuisineChipText: {
    color: "#3f3f46",
    fontWeight: "700",
  },
  cuisineChipTextActive: {
    color: "#ffffff",
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#18181b",
  },
  sectionSubtitle: {
    marginTop: 4,
    color: HOME_MUTED,
    fontSize: 13,
  },
  featuredRow: {
    paddingBottom: 4,
  },
  featuredCard: {
    width: 244,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 12,
    marginRight: 14,
  },
  featuredImage: {
    width: "100%",
    height: 164,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#e5e7eb",
  },
  featuredImageFallback: {
    backgroundColor: "#f1f5f9",
  },
  featuredRating: {
    position: "absolute",
    top: 22,
    right: 22,
    backgroundColor: HOME_ACCENT,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  featuredRatingText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  featuredName: {
    color: "#18181b",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  featuredMeta: {
    color: HOME_MUTED,
    fontSize: 13,
    marginBottom: 2,
  },
  listColumn: {
    gap: 12,
  },
  favoriteCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteImage: {
    width: 82,
    height: 82,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: "#e5e7eb",
  },
  favoriteBody: {
    flex: 1,
  },
  favoriteTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  favoriteName: {
    flex: 1,
    color: "#18181b",
    fontSize: 16,
    fontWeight: "800",
    marginRight: 8,
  },
  favoriteBadge: {
    backgroundColor: "#fff1eb",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  favoriteBadgeText: {
    color: HOME_ACCENT,
    fontSize: 11,
    fontWeight: "800",
  },
  favoriteAddress: {
    color: "#4b5563",
    fontSize: 13,
    marginBottom: 6,
  },
  favoriteDescription: {
    color: HOME_MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  plateCard: {
    width: 220,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 12,
    marginRight: 14,
  },
  plateImage: {
    width: "100%",
    height: 136,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#e5e7eb",
  },
  plateName: {
    color: "#18181b",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4,
  },
  plateRestaurant: {
    color: "#374151",
    fontSize: 13,
    marginBottom: 4,
  },
  plateMeta: {
    color: HOME_MUTED,
    fontSize: 12,
  },
});
