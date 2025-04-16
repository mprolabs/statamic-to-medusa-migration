'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

// Mock order data - in a real app, this would come from an API
interface Order {
  id: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageSrc: string;
  }>;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-123456',
    date: '2023-10-15',
    total: 128.45,
    status: 'delivered',
    items: [
      {
        id: 'item-1',
        name: 'Basic T-shirt',
        price: 32.99,
        quantity: 2,
        imageSrc: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      },
      {
        id: 'item-2',
        name: 'Designer Jeans',
        price: 62.47,
        quantity: 1,
        imageSrc: 'https://images.unsplash.com/photo-1600717535275-0b18ede2f7fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      }
    ]
  },
  {
    id: 'ORD-789012',
    date: '2023-11-03',
    total: 89.99,
    status: 'shipped',
    items: [
      {
        id: 'item-3',
        name: 'Running Shoes',
        price: 89.99,
        quantity: 1,
        imageSrc: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      }
    ]
  },
  {
    id: 'ORD-345678',
    date: '2023-11-28',
    total: 224.97,
    status: 'processing',
    items: [
      {
        id: 'item-4',
        name: 'Winter Jacket',
        price: 149.99,
        quantity: 1,
        imageSrc: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      },
      {
        id: 'item-5',
        name: 'Wool Scarf',
        price: 24.99,
        quantity: 3,
        imageSrc: 'https://images.unsplash.com/photo-1584736286279-f4c3156db2a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      }
    ]
  }
];

function getStatusColor(status: Order['status']) {
  switch (status) {
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchOrders = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setOrders(mockOrders);
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">No orders yet</h1>
          <p className="mt-4 text-gray-500">You haven't placed any orders yet.</p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Your Orders</h1>
        <p className="mt-2 text-sm text-gray-500">
          Check the status of recent orders, manage returns, and download invoices.
        </p>

        <div className="mt-12 space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div
                className="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order {order.id}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Placed on {formatDate(order.date)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <ChevronRightIcon
                    className={`h-5 w-5 text-gray-400 ml-4 transform transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {expandedOrderId === order.id && (
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Total amount</dt>
                      <dd className="mt-1 text-sm text-gray-900">${order.total.toFixed(2)}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Items</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <ul role="list" className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {order.items.map((item) => (
                            <li key={item.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <img
                                  src={item.imageSrc}
                                  alt={item.name}
                                  className="h-10 w-10 object-cover rounded-md"
                                />
                                <div className="ml-3">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="ml-4">
                                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View invoice
                    </button>
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Track order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
