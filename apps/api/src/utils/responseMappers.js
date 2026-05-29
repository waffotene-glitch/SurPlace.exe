const mapUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  managedRestaurant: user.managedRestaurant,
});

const mapRestaurant = (restaurant) => ({
  id: restaurant._id,
  manager: restaurant.manager,
  name: restaurant.name,
  description: restaurant.description,
  coverImageUrl: restaurant.coverImageUrl,
  cuisineTags: restaurant.cuisineTags,
  location: restaurant.location,
  averageRating: restaurant.averageRating,
  totalReviews: restaurant.totalReviews,
  createdAt: restaurant.createdAt,
  updatedAt: restaurant.updatedAt,
});

const mapPlate = (plate) => ({
  id: plate._id,
  restaurant: plate.restaurant,
  name: plate.name,
  description: plate.description,
  imageUrl: plate.imageUrl,
  price: plate.price,
  isAvailable: plate.isAvailable,
  averageRating: plate.averageRating,
  totalReviews: plate.totalReviews,
  createdAt: plate.createdAt,
  updatedAt: plate.updatedAt,
});

module.exports = {
  mapUser,
  mapRestaurant,
  mapPlate,
};

