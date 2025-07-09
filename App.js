import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './src/services/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState(new Set());
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation] = useState('Frisco, TX');
  const [notifications] = useState(3);

  const categories = [
    { id: 'all', name: 'All', icon: '🏪' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'food', name: 'Food', icon: '🍕' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'sports', name: 'Sports', icon: '⚽' }
  ];

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          stores (
            name,
            address,
            rating,
            review_count
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      Alert.alert('Error', 'Failed to load deals. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.stores?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (dealId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(dealId)) {
      newFavorites.delete(dealId);
    } else {
      newFavorites.add(dealId);
    }
    setFavorites(newFavorites);
  };

  const DealCard = ({ deal }) => (
    <View style={styles.dealCard}>
      {/* Image Placeholder */}
      <View style={styles.dealImage}>
        <View style={styles.imageGradient}>
          <Ionicons name="camera" size={40} color="white" style={{ opacity: 0.5 }} />
        </View>
        
        {/* Flash Deal Badge */}
        {deal.is_flash_deal && (
          <View style={styles.flashBadge}>
            <Ionicons name="flash" size={12} color="white" />
            <Text style={styles.flashText}>FLASH</Text>
          </View>
        )}
        
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => toggleFavorite(deal.id)}
        >
          <Ionicons
            name={favorites.has(deal.id) ? "heart" : "heart-outline"}
            size={20}
            color={favorites.has(deal.id) ? "#FF4444" : "#666"}
          />
        </TouchableOpacity>
        
        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{deal.discount_percentage}% OFF</Text>
        </View>
      </View>

      {/* Deal Content */}
      <View style={styles.dealContent}>
        <Text style={styles.dealTitle} numberOfLines={2}>{deal.title}</Text>
        
        <View style={styles.storeInfo}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.storeName}>{deal.stores?.name}</Text>
          <Text style={styles.distance}>• 0.5 mi</Text>
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.rating}>{deal.stores?.rating || 4.5}</Text>
          <Text style={styles.reviews}>({deal.stores?.review_count || 0})</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>{deal.description}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.dealPrice}>${deal.deal_price}</Text>
          <Text style={styles.originalPrice}>${deal.original_price}</Text>
          <View style={styles.expiryContainer}>
            <Ionicons name="time" size={14} color="#FF8C00" />
            <Text style={styles.expiryText}>2 hours</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <Text style={styles.quantityText}>
            {deal.quantity > 100 ? 'No limit' : `${deal.quantity} left`}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.shareBtn}>
              <Ionicons name="share" size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.visitBtn}>
              <Ionicons name="navigate" size={16} color="white" />
              <Text style={styles.visitText}>Visit Store</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const HomeScreen = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>LocalSlash</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color="#CCE5FF" />
              <Text style={styles.locationText}>{userLocation}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications" size={24} color="white" />
              {notifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{notifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileBtn}>
              <Ionicons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search deals or stores..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryBtn,
                selectedCategory === category.id && styles.activeCategoryBtn
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredDeals.length} deals found near you
        </Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter" size={16} color="#0066CC" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Deals List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading deals...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDeals}
          renderItem={({ item }) => <DealCard deal={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.dealsContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const FavoritesScreen = () => (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>My Favorites</Text>
      </View>
      {favorites.size === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No favorite deals yet</Text>
          <Text style={styles.emptySubtitle}>Tap the heart icon on deals to save them here</Text>
        </View>
      ) : (
        <FlatList
          data={deals.filter(deal => favorites.has(deal.id))}
          renderItem={({ item }) => <DealCard deal={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.dealsContainer}
        />
      )}
    </View>
  );

  const PostDealScreen = () => (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Post a Deal</Text>
      </View>
      <View style={styles.emptyContainer}>
        <Ionicons name="add-circle-outline" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>Coming Soon</Text>
        <Text style={styles.emptySubtitle}>Store owners will be able to post deals here</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0066CC" />
      
      {/* Main Content */}
      {activeTab === 'home' && <HomeScreen />}
      {activeTab === 'favorites' && <FavoritesScreen />}
      {activeTab === 'post' && <PostDealScreen />}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={24}
            color={activeTab === 'home' ? '#0066CC' : '#666'}
          />
          <Text style={[styles.navText, activeTab === 'home' && styles.activeNavText]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setActiveTab('favorites')}
        >
          <Ionicons
            name={activeTab === 'favorites' ? 'heart' : 'heart-outline'}
            size={24}
            color={activeTab === 'favorites' ? '#0066CC' : '#666'}
          />
          <Text style={[styles.navText, activeTab === 'favorites' && styles.activeNavText]}>
            Favorites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setActiveTab('post')}
        >
          <View style={styles.postBtnContainer}>
            <Ionicons name="add" size={20} color="white" />
          </View>
          <Text style={[styles.navText, { color: '#0066CC' }]}>Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0066CC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#CCE5FF',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    marginRight: 15,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeCategoryBtn: {
    backgroundColor: '#0066CC',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    color: '#0066CC',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  dealsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dealImage: {
    height: 180,
    position: 'relative',
  },
  imageGradient: {
    flex: 1,
    backgroundColor: '#6366F1',
    backgroundImage: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flashText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  discountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#00AA44',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealContent: {
    padding: 16,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  storeName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 2,
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00AA44',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 12,
    color: '#FF8C00',
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    padding: 8,
    marginRight: 8,
  },
  visitBtn: {
    backgroundColor: '#0066CC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  visitText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  screenHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingVertical: 8,
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#0066CC',
  },
  postBtnContainer: {
    backgroundColor: '#0066CC',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});