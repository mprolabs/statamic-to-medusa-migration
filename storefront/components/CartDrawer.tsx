'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter
} from '../packages/ui/src/components/sheet';
import { Button } from '../packages/ui/src/components/button';
import { ScrollArea } from '../packages/ui/src/components/scroll-area';
import { useCartStore } from '../store/cart';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, totalPrice, removeItem, updateQuantity } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-md sm:max-w-md" side="right">
        <SheetHeader className="px-1">
          <SheetTitle>Shopping cart</SheetTitle>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <XMarkIcon className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>

        <div className="mt-8 flex h-full flex-col">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Your cart is empty</p>
              <Button variant="link" onClick={onClose} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <ScrollArea className="flex-1 pr-4">
              <ul role="list" className="-my-6 divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={`${item.id}-${item.variantId}`} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      {item.imageSrc && (
                        <img
                          src={item.imageSrc}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${item.price.toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.variantName}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 border rounded-l-md bg-gray-100 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-4">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                            className="px-2 py-1 border rounded-r-md bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id, item.variantId)}
                          className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}

          {items.length > 0 && (
            <SheetFooter className="border-t border-gray-200 px-4 py-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>${totalPrice.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href="/checkout" onClick={onClose}>
                    Checkout
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                <p>
                  or{' '}
                  <Button
                    variant="link"
                    onClick={onClose}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </Button>
                </p>
              </div>
            </SheetFooter>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
