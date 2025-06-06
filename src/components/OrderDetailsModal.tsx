import React from 'react';
import { X, ShoppingBag, CreditCard } from 'lucide-react';
import { getCurrencySymbol } from '../utils/currency';
import { useTranslation } from 'react-i18next';

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  variation: {
    title: string;
    price: number;
  };
  addons?: Array<{ options?: Array<{ price: number }> }>;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    items: OrderItem[];
    orderAmount: number;
    taxationAmount: number;
    paymentMethod: string;
    orderStatus: string;
    user?: { name?: string; phone?: string };
    deliveryAddress?: { deliveryAddress?: string };
  } | null;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order
}: OrderDetailsModalProps) {
  const { t } = useTranslation();
  const currencySymbol = getCurrencySymbol();

  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) =>
    `${currencySymbol}${amount.toFixed(2)}`;

  // Normalize to one of your json status keys, fallback to "other"
  const raw = order.orderStatus.toLowerCase();
  let statusKey = 'other';
  if (raw.includes('delivered')) statusKey = 'delivered';
  else if (raw.includes('cancelled')) statusKey = 'cancelled';
  else if (raw.includes('in progress')) statusKey = 'inprogress';
  else if (raw.includes('accepted')) statusKey = 'accepted';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShoppingBag className="h-5 w-5 text-brand-primary mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t('orderDetails.order')} #{order.id}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                {
                  delivered: 'bg-green-100 text-green-800',
                  cancelled: 'bg-red-100 text-red-800',
                  inprogress: 'bg-blue-100 text-blue-800',
                  accepted: 'bg-purple-100 text-purple-800',
                  other: 'bg-yellow-100 text-yellow-800'
                }[statusKey]
              }`}
            >
              {t(`orderDetails.status.${statusKey}`)}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              {t('orderDetails.itemsTitle')}
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('orderDetails.column.item')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('orderDetails.column.quantity')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('orderDetails.column.price')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('orderDetails.column.total')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map(item => {
                    // calculate addons total
                    const addonsTotal = item.addons?.reduce(
                      (sum, a) =>
                        sum +
                        (a.options?.reduce((s, o) => s + o.price, 0) ?? 0),
                      0
                    ) ?? 0;
                    const unitPrice = (item.variation?.price ?? 0) + addonsTotal;
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.title}{' '}
                          {item.variation && `(${item.variation.title})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(unitPrice * item.quantity)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Information */}
          {(order.user?.name ||
            order.deliveryAddress?.deliveryAddress ||
            order.user?.phone) && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                {t('orderDetails.customerInfoTitle')}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {order.user?.name && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">
                      {t('orderDetails.customerNameLabel')}:
                    </span>{' '}
                    {order.user.name}
                  </p>
                )}
                {order.deliveryAddress?.deliveryAddress && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">
                      {t('orderDetails.customerAddressLabel')}:
                    </span>{' '}
                    {order.deliveryAddress.deliveryAddress}
                  </p>
                )}
                {order.user?.phone && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">
                      {t('orderDetails.customerPhoneLabel')}:
                    </span>{' '}
                    {order.user.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              {t('orderDetails.summaryTitle')}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">
                  {t('orderDetails.subtotal')}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(
                    order.orderAmount - order.taxationAmount
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">
                  {t('orderDetails.tax')}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.taxationAmount)}
                </span>
              </div>
              <div className="flex justify-between py-2 font-medium">
                <span className="text-sm text-gray-900">
                  {t('orderDetails.total')}
                </span>
                <span className="text-sm text-gray-900">
                  {formatCurrency(order.orderAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              {t('orderDetails.paymentTitle')}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg flex items-center">
              <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">
                {order.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
