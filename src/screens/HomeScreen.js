import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';

export default function HomeScreen() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const renderDeal = ({ item }) => (
    <View style={styles.dealCard}>
      <Text style={styles.dealTitle}>{item.title}</Text>
      <Text style={styles.storeName}>{item.stores?.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.dealPrice}>${item.deal_price}</Text>
        <Text style={styles.originalPrice}>${item.original_price}</Text>
        <Text style={styles.discount}>{item.discount_percentage}% OFF</Text>
      </View>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading deals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LocalSlash</Text>
        <Text style={styles.headerSubtitle}>Local deals near you</Text>
      </View>
      
      <FlatList
        data={deals}
        renderItem={renderDeal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#0066CC',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCE5FF',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  dealCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  storeName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#009900',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#999',
    marginLeft: 8,
  },
  discount: {
    fontSize: 12,
    backgroundColor: '#FF4444',
    color: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});