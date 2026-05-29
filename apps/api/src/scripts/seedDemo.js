require("dotenv").config();

const mongoose = require("mongoose");
const { connectDatabase, disconnectDatabase } = require("../config/db");
const { ROLES } = require("../constants/roles");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Plate = require("../models/Plate");
const Review = require("../models/Review");
const Like = require("../models/Like");

const DEMO_PASSWORD = "Password123!";

const demoUsers = [
  {
    fullName: "Aline Mvondo",
    email: "alice@verifiedfood.demo",
    password: DEMO_PASSWORD,
    role: ROLES.USER,
  },
  {
    fullName: "Bruno Essomba",
    email: "bruno@verifiedfood.demo",
    password: DEMO_PASSWORD,
    role: ROLES.USER,
  },
  {
    fullName: "Nadia Fouda",
    email: "nadia@verifiedfood.demo",
    password: DEMO_PASSWORD,
    role: ROLES.USER,
  },
];

const managerUsers = [
  {
    fullName: "Nadine Mbiya",
    email: "manager@verifiedfood.demo",
    password: DEMO_PASSWORD,
    role: ROLES.MANAGER,
    isPrimary: true,
  },
  {
    fullName: "Serge Talla",
    email: "serge.support@verifiedfood.demo",
    password: DEMO_PASSWORD,
    role: ROLES.MANAGER,
  },
  {
    fullName: "Clarisse Ndzi",
    email: "clarisse.support@verifiedfood.demo",
    password: DEMO_PASSWORD,
    role: ROLES.MANAGER,
  },
  {
    fullName: "Patrick Muna",
    email: "patrick.support@verifiedfood.demo",
    password: DEMO_PASSWORD,
    role: ROLES.MANAGER,
  },
  {
    fullName: "Elodie Kamga",
    email: "elodie.support@verifiedfood.demo",
    password: DEMO_PASSWORD,
    role: ROLES.MANAGER,
  },
];

const imageLibrary = {
  restaurants: [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1200&q=80",
  ],
  plates: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516685018646-549d52f3b9a7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
  ],
  reviewImages: [
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1514516345957-556ca7d90a29?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1457666134378-6b77915bd5f2?auto=format&fit=crop&w=1200&q=80",
  ],
};

const restaurantBlueprints = [
  {
    name: "Maison du Wouri",
    description:
      "A polished Douala dining room serving grilled seafood, pepper sauces, and elegant Cameroonian comfort food near the river.",
    address: "Bonanjo Waterfront, Douala, Cameroon",
    coordinates: [9.6941, 4.0511],
    cuisineTags: ["Seafood", "Cameroonian", "Grill"],
    plates: [
      {
        name: "Captain Fish Grill",
        description: "Whole captain fish grilled over charcoal with pepper sauce and miondo.",
        price: 6500,
      },
      {
        name: "Ndole Prestige",
        description: "Silky ndole with beef, shrimp, and soft plantain on the side.",
        price: 4200,
      },
      {
        name: "Coconut Shrimp Rice",
        description: "Fragrant jasmine rice topped with coconut shrimp and herbs.",
        price: 4800,
        imageUrl: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1200&q=80",
      },
      {
        name: "Plantain Pepper Bowl",
        description: "Sweet plantains, grilled vegetables, and smoky tomato pepper relish.",
        price: 3300,
      },
      {
        name: "Spiced Crab Cassava",
        description: "Crab meat cooked in a mild spice broth with cassava fingers.",
        price: 5900,
      },
    ],
  },
  {
    name: "Le Jardin de Bastos",
    description:
      "A calm Yaounde terrace known for refined brunch plates, colorful salads, and easy business lunches.",
    address: "Rue 1.744, Bastos, Yaounde, Cameroon",
    coordinates: [11.5215, 3.8932],
    cuisineTags: ["Fusion", "Brunch", "Healthy"],
    plates: [
      {
        name: "Avocado Suya Toast",
        description: "Toasted sourdough layered with avocado cream and sliced suya beef.",
        price: 3900,
      },
      {
        name: "Garden Chicken Bowl",
        description: "Roasted chicken, couscous, seasonal greens, and citrus vinaigrette.",
        price: 4500,
      },
      {
        name: "Mango Ginger Parfait",
        description: "Yogurt parfait with mango compote, ginger granola, and roasted coconut.",
        price: 2600,
      },
      {
        name: "Braised Tilapia Wrap",
        description: "Soft wrap filled with braised tilapia, cabbage slaw, and herb mayo.",
        price: 3700,
      },
      {
        name: "Bastos Veggie Pasta",
        description: "Fresh pasta with roasted peppers, mushrooms, and parmesan cream.",
        price: 4100,
      },
    ],
  },
  {
    name: "Braise & Braise Akwa",
    description:
      "An energetic Akwa spot with late-evening smoke grill favorites, quick service, and bold spice blends.",
    address: "Boulevard de la Liberte, Akwa, Douala, Cameroon",
    coordinates: [9.7088, 4.0489],
    cuisineTags: ["Street Food", "Grill", "Fast Casual"],
    plates: [
      {
        name: "Suya Beef Board",
        description: "Thin sliced suya beef with onions, spice dust, and fresh cucumber.",
        price: 3500,
      },
      {
        name: "Chicken Chilli Box",
        description: "Grilled chicken pieces tossed in chilli glaze with seasoned potatoes.",
        price: 4300,
      },
      {
        name: "Miondo Burger",
        description: "A playful sandwich with smoked beef, cabbage, and cassava ribbon bun.",
        price: 3900,
      },
      {
        name: "Pepper Snail Skillet",
        description: "Tender snail sauteed with green pepper, garlic, and herbs.",
        price: 5200,
      },
      {
        name: "Roasted Plantain Duo",
        description: "Two styles of roasted plantain served with groundnut dip and hot sauce.",
        price: 2400,
      },
    ],
  },
  {
    name: "Yaounde Table 237",
    description:
      "A modern local kitchen in the city center offering polished classics, quiet service, and reliable family portions.",
    address: "Avenue Kennedy, Centre Ville, Yaounde, Cameroon",
    coordinates: [11.5174, 3.8697],
    cuisineTags: ["Cameroonian", "Family Dining", "Traditional"],
    plates: [
      {
        name: "Koki Plantain Plate",
        description: "Soft koki with ripe plantains and a spoon of red palm oil sauce.",
        price: 2800,
      },
      {
        name: "Eru Harvest Bowl",
        description: "Rich eru cooked with waterleaf, smoked fish, and lean beef.",
        price: 4600,
      },
      {
        name: "Yellow Soup Chicken",
        description: "Tender chicken in yellow soup with pounded yam.",
        price: 5100,
      },
      {
        name: "Puff-Puff Breakfast",
        description: "Warm puff-puff served with bean stew and scrambled egg.",
        price: 2300,
      },
      {
        name: "Cassava Leaf Rice",
        description: "Savory cassava leaf stew paired with lightly seasoned white rice.",
        price: 3400,
      },
    ],
  },
  {
    name: "Douala Sunset Bistro",
    description:
      "A stylish rooftop-style bistro near Bonapriso with polished cocktails, grilled platters, and sunset-friendly service.",
    address: "Rue Koloko, Bonapriso, Douala, Cameroon",
    coordinates: [9.7248, 4.0342],
    cuisineTags: ["Bistro", "Seafood", "Contemporary"],
    plates: [
      {
        name: "Lobster Pepper Tagliatelle",
        description: "Tagliatelle in spicy cream sauce with lobster medallions and herbs.",
        price: 7900,
      },
      {
        name: "Sunset Chicken Skewers",
        description: "Citrus-marinated chicken skewers with roasted corn and garlic sauce.",
        price: 4700,
      },
      {
        name: "Prawn Jollof Pot",
        description: "Tomato rice pot finished with prawns, peppers, and spring onion.",
        price: 5400,
      },
      {
        name: "Smoked Salmon Plantain Cakes",
        description: "Crisp plantain cakes topped with smoked salmon and lime yogurt.",
        price: 4400,
      },
      {
        name: "Cocoa Rub Beef Fillet",
        description: "Tender beef fillet with cocoa spice rub and sweet potato mash.",
        price: 6800,
      },
    ],
  },
];

const reviewTemplates = [
  {
    targetType: "restaurant",
    rating: 5,
    comment: "The service was confident, the dining room felt polished, and every plate reached the table in great shape.",
  },
  {
    targetType: "restaurant",
    rating: 4,
    comment: "Good atmosphere and strong flavors. I would happily bring friends here again.",
  },
  {
    targetType: "restaurant",
    rating: 5,
    comment: "This place feels dependable for a quality meal. The staff stayed warm even during busy service.",
  },
  {
    targetType: "plate",
    rating: 5,
    comment: "Beautiful presentation and the flavor balance was right from the first bite.",
  },
  {
    targetType: "plate",
    rating: 4,
    comment: "Very satisfying portion and the seasoning held up well throughout the plate.",
  },
  {
    targetType: "plate",
    rating: 5,
    comment: "Fresh ingredients, good texture, and the finish on the sauce made this easy to recommend.",
  },
];

const dayOffsets = [2, 4, 6, 9, 12, 15, 18, 22, 25, 29, 33, 37, 41, 46, 52];

function buildVerifiedCoordinates(baseCoordinates, lngOffset, latOffset) {
  return {
    lng: Number((baseCoordinates[0] + lngOffset).toFixed(6)),
    lat: Number((baseCoordinates[1] + latOffset).toFixed(6)),
  };
}

function buildRecentDate(dayOffset, minuteOffset) {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - dayOffset);
  timestamp.setHours(12, minuteOffset, 0, 0);
  return timestamp;
}

function buildMediaForReview(_restaurantIndex, _reviewSlot, globalIndex) {
  return [
    {
      type: "image",
      url: imageLibrary.reviewImages[globalIndex % imageLibrary.reviewImages.length],
      source: "camera",
    },
  ];
}

function buildMediaDebugShape(review) {
  const media = review?.media?.[0] || null;

  return {
    media,
    "media[0].url": media?.url ?? null,
    "media[0].secureUrl": media?.secureUrl ?? null,
    "media[0].mediaUrl": media?.mediaUrl ?? null,
    "media[0].type": media?.type ?? null,
    "media[0].mediaType": media?.mediaType ?? null,
    "media[0].resourceType": media?.resourceType ?? null,
    "media[0].source": media?.source ?? null,
  };
}

async function recalculateRatingsForRestaurant(restaurantId) {
  const restaurantReviews = await Review.find({ restaurant: restaurantId });
  const restaurantAverage =
    restaurantReviews.reduce((sum, review) => sum + review.rating, 0) /
    (restaurantReviews.length || 1);

  await Restaurant.findByIdAndUpdate(restaurantId, {
    averageRating: restaurantReviews.length ? Number(restaurantAverage.toFixed(1)) : 0,
    totalReviews: restaurantReviews.length,
  });

  const plates = await Plate.find({ restaurant: restaurantId });
  for (const plate of plates) {
    const plateReviews = await Review.find({ plate: plate._id });
    const plateAverage =
      plateReviews.reduce((sum, review) => sum + review.rating, 0) /
      (plateReviews.length || 1);

    plate.averageRating = plateReviews.length ? Number(plateAverage.toFixed(1)) : 0;
    plate.totalReviews = plateReviews.length;
    await plate.save();
  }
}

async function resetCollections() {
  await Promise.all([
    Like.deleteMany({}),
    Review.deleteMany({}),
    Plate.deleteMany({}),
    Restaurant.deleteMany({}),
    User.deleteMany({}),
  ]);
}

async function createUsers() {
  try {
    await User.collection.dropIndex("managedRestaurant_1");
  } catch (error) {
    if (error.codeName !== "IndexNotFound") {
      throw error;
    }
  }

  await User.syncIndexes();

  const createdManagers = await User.create(managerUsers);
  const createdDemoUsers = await User.create(demoUsers);

  return {
    managers: createdManagers,
    primaryManager: createdManagers.find((manager) => manager.email === "manager@verifiedfood.demo"),
    demoUsers: createdDemoUsers,
  };
}

async function createRestaurantsAndPlates(managers) {
  const restaurants = [];
  const plates = [];

  for (let index = 0; index < restaurantBlueprints.length; index += 1) {
    const blueprint = restaurantBlueprints[index];
    const manager = managers[index];

    const restaurant = await Restaurant.create({
      manager: manager._id,
      name: blueprint.name,
      description: blueprint.description,
      coverImageUrl: imageLibrary.restaurants[index % imageLibrary.restaurants.length],
      cuisineTags: blueprint.cuisineTags,
      location: {
        address: blueprint.address,
        coordinates: {
          type: "Point",
          coordinates: blueprint.coordinates,
        },
      },
    });

    manager.managedRestaurant = restaurant._id;
    await manager.save();

    restaurants.push(restaurant);

    for (let plateIndex = 0; plateIndex < blueprint.plates.length; plateIndex += 1) {
      const plateBlueprint = blueprint.plates[plateIndex];
      const plate = await Plate.create({
        restaurant: restaurant._id,
        name: plateBlueprint.name,
        description: plateBlueprint.description,
        imageUrl:
          plateBlueprint.imageUrl ||
          imageLibrary.plates[(index * 5 + plateIndex) % imageLibrary.plates.length],
        price: plateBlueprint.price,
        isAvailable: true,
      });

      plates.push(plate);
    }
  }

  return { restaurants, plates };
}

async function createReviews(restaurants, plates, users) {
  const reviews = [];
  const plateMap = new Map();
  for (const plate of plates) {
    const list = plateMap.get(String(plate.restaurant)) || [];
    list.push(plate);
    plateMap.set(String(plate.restaurant), list);
  }

  for (let restaurantIndex = 0; restaurantIndex < restaurants.length; restaurantIndex += 1) {
    const restaurant = restaurants[restaurantIndex];
    const restaurantPlates = plateMap.get(String(restaurant._id)) || [];

    for (let reviewSlot = 0; reviewSlot < 6; reviewSlot += 1) {
      const template = reviewTemplates[reviewSlot % reviewTemplates.length];
      const reviewer = users[(restaurantIndex + reviewSlot) % users.length];
      const selectedPlate = template.targetType === "plate"
        ? restaurantPlates[reviewSlot % restaurantPlates.length]
        : null;
      const createdAt = buildRecentDate(
        dayOffsets[(restaurantIndex * 3 + reviewSlot) % dayOffsets.length],
        10 + restaurantIndex * 7 + reviewSlot * 5
      );

      const review = await Review.create({
        user: reviewer._id,
        restaurant: restaurant._id,
        plate: selectedPlate ? selectedPlate._id : null,
        targetType: template.targetType,
        rating: template.rating - (reviewSlot === 4 ? 1 : 0),
        comment:
          template.targetType === "plate"
            ? `${selectedPlate.name}: ${template.comment}`
            : `${restaurant.name}: ${template.comment}`,
        media: buildMediaForReview(restaurantIndex, reviewSlot, restaurantIndex * 6 + reviewSlot),
        verification: {
          submittedCoordinates: buildVerifiedCoordinates(
            restaurant.location.coordinates.coordinates,
            0.0002 + reviewSlot * 0.00003,
            0.0002 + restaurantIndex * 0.00004
          ),
          distanceMeters: 35 + restaurantIndex * 8 + reviewSlot * 4,
          radiusMeters: 200,
          isVerifiedOnSite: true,
        },
        likesCount: 0,
        createdAt,
        updatedAt: createdAt,
      });

      reviews.push(review);
    }
  }

  return reviews;
}

async function createLikes(reviews, demoUsers) {
  const likePlans = [];

  reviews.forEach((review, index) => {
    const firstLiker = demoUsers[(index + 1) % demoUsers.length];
    const secondLiker = demoUsers[(index + 2) % demoUsers.length];

    if (index % 2 === 0) {
      likePlans.push({ user: firstLiker._id, review: review._id });
    }

    if (index % 3 === 0) {
      likePlans.push({ user: secondLiker._id, review: review._id });
    }
  });

  if (!likePlans.length) {
    return 0;
  }

  await Like.insertMany(likePlans);

  for (const review of reviews) {
    const likesCount = likePlans.filter((like) => String(like.review) === String(review._id)).length;
    if (likesCount > 0) {
      await Review.findByIdAndUpdate(review._id, { likesCount });
    }
  }

  return likePlans.length;
}

async function recalculateAllRatings(restaurants) {
  for (const restaurant of restaurants) {
    await recalculateRatingsForRestaurant(restaurant._id);
  }
}

async function seed() {
  await connectDatabase();

  await resetCollections();

  const { managers, primaryManager, demoUsers: createdDemoUsers } = await createUsers();
  const { restaurants, plates } = await createRestaurantsAndPlates(managers);
  const reviews = await createReviews(restaurants, plates, createdDemoUsers);
  await createLikes(reviews, createdDemoUsers);
  await recalculateAllRatings(restaurants);
  const imageReviewCount = reviews.filter((review) => review.media[0]?.type === "image").length;
  const videoReviewCount = reviews.filter((review) => review.media[0]?.type === "video").length;
  const sampleImageReview = await Review.findOne({ "media.0.type": "image" }).lean();
  const sampleVideoReview = await Review.findOne({ "media.0.type": "video" }).lean();

  console.log("Demo data reset complete.");
  console.log("");
  console.log("Manager credentials:");
  console.log(`- ${primaryManager.email} / ${DEMO_PASSWORD}`);
  console.log("");
  console.log("User credentials:");
  createdDemoUsers.forEach((user) => {
    console.log(`- ${user.email} / ${DEMO_PASSWORD}`);
  });
  console.log("");
  console.log(`Restaurants created: ${restaurants.length}`);
  console.log(`Plates created: ${plates.length}`);
  console.log(`Reviews created: ${reviews.length}`);
  console.log(`Image reviews created: ${imageReviewCount}`);
  console.log(`Video reviews created: ${videoReviewCount}`);
  console.log("Sample image review media:");
  console.log(JSON.stringify(buildMediaDebugShape(sampleImageReview), null, 2));
  console.log("Sample video review media:");
  console.log(JSON.stringify(buildMediaDebugShape(sampleVideoReview), null, 2));
}

seed()
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
    await mongoose.connection.close();
  });
