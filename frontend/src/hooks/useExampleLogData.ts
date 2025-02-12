import { useState, useEffect } from 'react';
import { subDays, addMinutes, addSeconds } from 'date-fns';

interface Log {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  metadata: Record<string, any>;
}

const services = [
  'AuthService',
  'PaymentService',
  'UserService',
  'OrderService',
  'NotificationService',
  'SearchService',
];

const actions = {
  AuthService: [
    'User login attempt',
    'Login successful',
    'Login failed',
    'Password reset requested',
    'Two-factor authentication initiated',
  ],
  PaymentService: [
    'Payment initiated',
    'Payment processing',
    'Payment successful',
    'Payment failed',
    'Refund processed',
  ],
  UserService: [
    'Profile updated',
    'Settings changed',
    'Preferences saved',
    'Account verified',
    'Profile picture uploaded',
  ],
  OrderService: [
    'Order created',
    'Order processing',
    'Order shipped',
    'Order delivered',
    'Order cancelled',
  ],
  NotificationService: [
    'Email notification sent',
    'Push notification delivered',
    'SMS notification sent',
    'In-app notification created',
    'Notification preferences updated',
  ],
  SearchService: [
    'Search query executed',
    'Search results filtered',
    'Search suggestions generated',
    'Search history updated',
    'Advanced search performed',
  ],
};

const userIds = [
  'user_123',
  'user_456',
  'user_789',
  'user_101',
  'user_102',
];

const generateRandomMetadata = (service: string, action: string) => {
  const baseMetadata = {
    user_id: userIds[Math.floor(Math.random() * userIds.length)],
    ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  };

  switch (service) {
    case 'AuthService':
      return {
        ...baseMetadata,
        auth_method: Math.random() > 0.5 ? 'password' : '2fa',
        session_id: `sess_${Math.random().toString(36).substr(2, 9)}`,
      };
    case 'PaymentService':
      return {
        ...baseMetadata,
        amount: Math.floor(Math.random() * 1000),
        currency: 'USD',
        payment_method: ['credit_card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 3)],
      };
    case 'UserService':
      return {
        ...baseMetadata,
        profile_section: ['personal', 'security', 'preferences'][Math.floor(Math.random() * 3)],
        changes_made: Math.floor(Math.random() * 5),
      };
    case 'OrderService':
      return {
        ...baseMetadata,
        order_id: `ord_${Math.random().toString(36).substr(2, 9)}`,
        items_count: Math.floor(Math.random() * 10) + 1,
        total_amount: Math.floor(Math.random() * 1000),
      };
    case 'NotificationService':
      return {
        ...baseMetadata,
        notification_type: ['email', 'push', 'sms', 'in_app'][Math.floor(Math.random() * 4)],
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
      };
    case 'SearchService':
      return {
        ...baseMetadata,
        query: ['product', 'service', 'support', 'help'][Math.floor(Math.random() * 4)],
        results_count: Math.floor(Math.random() * 100),
        page: Math.floor(Math.random() * 5) + 1,
      };
    default:
      return baseMetadata;
  }
};

const generateRandomLogs = (count: number): Log[] => {
  const logs: Log[] = [];
  let currentTime = subDays(new Date(), 7);

  for (let i = 0; i < count; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const action = actions[service][Math.floor(Math.random() * actions[service].length)];
    const level = Math.random() > 0.9 ? 'error' : Math.random() > 0.8 ? 'warn' : 'info';

    // Add random minutes and seconds to create realistic timestamps
    currentTime = addSeconds(addMinutes(currentTime, Math.floor(Math.random() * 60)), Math.floor(Math.random() * 60));

    logs.push({
      timestamp: currentTime.toISOString(),
      level,
      message: action,
      service,
      metadata: generateRandomMetadata(service, action),
    });
  }

  return logs;
};

export function useExampleLogData() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    // Generate initial logs
    setLogs(generateRandomLogs(100));

    // Simulate real-time log updates
    const interval = setInterval(() => {
      setLogs(prevLogs => {
        const newLog = generateRandomLogs(1)[0];
        return [...prevLogs, newLog];
      });
    }, 30000); // Add new log every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { logs };
}
