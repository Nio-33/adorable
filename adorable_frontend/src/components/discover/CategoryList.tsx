import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Category } from '../../services/DiscoverService';
import { MapPin, Utensils, Coffee, ShoppingBag, Ticket, Camera } from 'lucide-react-native';

interface CategoryListProps {
  categories: Category[];
  onCategoryPress: (category: Category) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: 'utensils',
    description: 'Find great places to eat',
  },
  {
    id: 'cafes',
    name: 'Cafes',
    icon: 'coffee',
    description: 'Discover cozy coffee shops',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'shopping-bag',
    description: 'Explore shopping venues',
  },
  {
    id: 'attractions',
    name: 'Attractions',
    icon: 'ticket',
    description: 'Visit popular attractions',
  },
  {
    id: 'photo_spots',
    name: 'Photo Spots',
    icon: 'camera',
    description: 'Find Instagram-worthy locations',
  },
];

const CategoryIcon: React.FC<{ icon: string; color: string; size: number }> = ({
  icon,
  color,
  size,
}) => {
  switch (icon) {
    case 'utensils':
      return <Utensils color={color} size={size} />;
    case 'coffee':
      return <Coffee color={color} size={size} />;
    case 'shopping-bag':
      return <ShoppingBag color={color} size={size} />;
    case 'ticket':
      return <Ticket color={color} size={size} />;
    case 'camera':
      return <Camera color={color} size={size} />;
    default:
      return <MapPin color={color} size={size} />;
  }
};

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onCategoryPress,
}) => {
  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {displayCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryButton}
          onPress={() => onCategoryPress(category)}
        >
          <View style={styles.iconContainer}>
            <CategoryIcon icon={category.icon} color="#fff" size={24} />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
          {category.description && (
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {category.description}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 20,
    width: 100,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
