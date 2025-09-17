import { useState, useEffect } from 'react';
import { Product, Customer, Sale, Review, Analytics } from '../types';

export const useMockData = (storeId: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (!storeId) return;

    // Mock products
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Formation Web Development',
        description: 'Apprenez le développement web de A à Z',
        price: 299,
        storeId,
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'E-book Marketing Digital',
        description: 'Guide complet du marketing digital',
        price: 49,
        storeId,
        isActive: true,
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '3',
        name: 'Template UI/UX Design',
        description: 'Pack de templates professionnels',
        price: 99,
        storeId,
        isActive: true,
        createdAt: new Date('2024-02-01'),
      },
    ];

    // Mock customers
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Marie Dubois',
        email: 'marie.dubois@email.com',
        storeId,
        totalSpent: 348,
        ordersCount: 2,
        createdAt: new Date('2024-01-10'),
      },
      {
        id: '2',
        name: 'Pierre Martin',
        email: 'pierre.martin@email.com',
        storeId,
        totalSpent: 299,
        ordersCount: 1,
        createdAt: new Date('2024-01-20'),
      },
      {
        id: '3',
        name: 'Sophie Laurent',
        email: 'sophie.laurent@email.com',
        storeId,
        totalSpent: 148,
        ordersCount: 3,
        createdAt: new Date('2024-02-05'),
      },
    ];

    // Mock sales
    const mockSales: Sale[] = [
      {
        id: '1',
        productId: '1',
        customerId: '1',
        storeId,
        amount: 299,
        status: 'completed',
        createdAt: new Date('2024-01-12'),
      },
      {
        id: '2',
        productId: '2',
        customerId: '1',
        storeId,
        amount: 49,
        status: 'completed',
        createdAt: new Date('2024-01-25'),
      },
      {
        id: '3',
        productId: '1',
        customerId: '2',
        storeId,
        amount: 299,
        status: 'completed',
        createdAt: new Date('2024-02-01'),
      },
    ];

    // Mock reviews
    const mockReviews: Review[] = [
      {
        id: '1',
        productId: '1',
        customerId: '1',
        rating: 5,
        comment: 'Excellente formation, très complète !',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        productId: '2',
        customerId: '1',
        rating: 4,
        comment: 'Bon contenu, très utile pour débuter.',
        createdAt: new Date('2024-01-28'),
      },
    ];

    // Mock analytics
    const mockAnalytics: Analytics = {
      totalRevenue: 795,
      totalSales: 6,
      totalCustomers: 3,
      totalProducts: 3,
      monthlyRevenue: [200, 300, 295, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      topProducts: [
        { product: mockProducts[0], sales: 2 },
        { product: mockProducts[1], sales: 1 },
        { product: mockProducts[2], sales: 0 },
      ],
    };

    setProducts(mockProducts);
    setCustomers(mockCustomers);
    setSales(mockSales);
    setReviews(mockReviews);
    setAnalytics(mockAnalytics);
  }, [storeId]);

  return {
    products,
    customers,
    sales,
    reviews,
    analytics,
  };
};