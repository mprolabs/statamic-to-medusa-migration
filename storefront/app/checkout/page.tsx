'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '../../store/cart';

const steps = [
  { id: 'information', name: 'Shipping information' },
  { id: 'payment', name: 'Payment details' },
  { id: 'confirmation', name: 'Confirmation' },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState('information');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'US',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvc: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Your cart is empty</h1>
          <p className="mt-4 text-gray-500">Add some items to your cart before checking out.</p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const nextStep = () => {
    if (currentStep === 'information') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      setCurrentStep('confirmation');
    }
  };

  const prevStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('information');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For demo purposes, we're just simulating an API call
    setIsSubmitting(true);

    // Simulate checkout API call
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderComplete(true);
      setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
      clearCart();
    }, 1500);
  };

  const renderShippingInformation = () => (
    <div className="mt-6">
      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal code
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <div className="mt-1">
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentDetails = () => (
    <div className="mt-6">
      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
        <div className="sm:col-span-2">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
            Card number
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
            Name on card
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="cardName"
              name="cardName"
              value={formData.cardName}
              onChange={handleInputChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
            Expiry date (MM/YY)
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/YY"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
            CVC
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="cvc"
              name="cvc"
              value={formData.cvc}
              onChange={handleInputChange}
              placeholder="123"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <section className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0">
      <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={`${item.id}-${item.variantId}`} className="flex justify-between text-sm">
            <div>
              <p className="font-medium text-gray-900">
                {item.name} {item.variantName ? `(${item.variantName})` : ''}
              </p>
              <p className="text-gray-500">Qty {item.quantity}</p>
            </div>
            <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm font-medium">
          <p>Subtotal</p>
          <p>${totalPrice.toFixed(2)}</p>
        </div>
        <div className="flex justify-between text-sm font-medium mt-2">
          <p>Shipping</p>
          <p>$5.00</p>
        </div>
        <div className="flex justify-between text-sm font-medium mt-2">
          <p>Tax</p>
          <p>${(totalPrice * 0.1).toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Total</p>
          <p>${(totalPrice + 5 + totalPrice * 0.1).toFixed(2)}</p>
        </div>
      </div>
    </section>
  );

  const renderConfirmation = () => (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900">Review your order</h3>

      <div className="mt-6 space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Shipping information</h4>
          <div className="mt-2 text-sm text-gray-500">
            <p>{formData.firstName} {formData.lastName}</p>
            <p>{formData.address}</p>
            <p>{formData.city}, {formData.postalCode}</p>
            <p>{formData.country}</p>
            <p>{formData.email}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900">Payment details</h4>
          <div className="mt-2 text-sm text-gray-500">
            <p>Card ending in {formData.cardNumber.slice(-4)}</p>
            <p>Expires {formData.expiryDate}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderComplete = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 text-green-600 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Order complete!</h1>
        <p className="mt-2 text-xl text-gray-500">Thank you for your order.</p>
        <p className="mt-1 text-gray-500">Order ID: {orderId}</p>
        <p className="mt-4 text-sm text-gray-500">
          We've sent a confirmation to {formData.email}. You will receive shipping updates soon.
        </p>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );

  if (orderComplete) {
    return renderOrderComplete();
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Checkout</h1>

        <div className="mt-6">
          <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
              {steps.map((step) => (
                <li key={step.id} className="md:flex-1">
                  <div
                    className={`${
                      currentStep === step.id
                        ? 'border-indigo-600 text-indigo-600'
                        : steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-gray-300 text-gray-500'
                    } group pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4`}
                  >
                    <span className="text-xs text-indigo-600 font-semibold tracking-wide uppercase">
                      {steps.findIndex(s => s.id === step.id) + 1}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
          <section className="lg:col-span-7">
            <form onSubmit={handleSubmit}>
              {currentStep === 'information' && renderShippingInformation()}
              {currentStep === 'payment' && renderPaymentDetails()}
              {currentStep === 'confirmation' && renderConfirmation()}

              <div className="mt-10 flex justify-between">
                {currentStep !== 'information' && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                )}
                {currentStep !== 'confirmation' ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : 'Place order'}
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="lg:col-span-5">
            {renderOrderSummary()}
          </section>
        </div>
      </div>
    </div>
  );
}
