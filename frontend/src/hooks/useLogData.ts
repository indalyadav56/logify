import { useState, useEffect } from 'react';

interface Log {
  service: string;
  level: string;
  message: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export const useLogData = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    // Sample log data
    const sampleLogs: Log[] = [
      {
        service: "user_service",
        level: "info",
        message: "User logged in successfully",
        metadata: {
          action: "LOGIN",
          device_ip: "192.168.1.100",
          user_id: "77e7924e-ced8-4",
          device_type: "mobile",
          user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)",
          login_method: "oauth2",
          oauth_provider: "google"
        },
        timestamp: "2025-02-11T15:11:57+05:30"
      },
      {
        service: "payment_service",
        level: "error",
        message: "Payment transaction failed",
        metadata: {
          transaction_id: "tx_123456789",
          amount: 299.99,
          currency: "USD",
          payment_method: "credit_card",
          error_code: "INSUFFICIENT_FUNDS",
          card_last4: "4242",
          merchant_id: "merch_789"
        },
        timestamp: "2025-02-11T14:45:23+05:30"
      },
      {
        service: "auth_service",
        level: "warn",
        message: "Multiple failed login attempts detected",
        metadata: {
          ip_address: "203.0.113.1",
          attempt_count: 5,
          user_email: "user@example.com",
          location: "New York, US",
          security_action: "temporary_lockout"
        },
        timestamp: "2025-02-11T14:30:00+05:30"
      },
      {
        service: "order_service",
        level: "info",
        message: "New order created",
        metadata: {
          order_id: "ord_98765",
          customer_id: "cust_12345",
          total_amount: 150.50,
          items_count: 3,
          shipping_method: "express",
          estimated_delivery: "2025-02-14"
        },
        timestamp: "2025-02-11T14:15:30+05:30"
      },
      {
        service: "inventory_service",
        level: "error",
        message: "Stock synchronization failed",
        metadata: {
          warehouse_id: "wh_123",
          product_ids: ["prod_1", "prod_2", "prod_3"],
          error_type: "DATABASE_TIMEOUT",
          retry_count: 3,
          affected_items: 150
        },
        timestamp: "2025-02-11T14:00:00+05:30"
      },
      {
        service: "notification_service",
        level: "info",
        message: "Push notification sent",
        metadata: {
          notification_id: "notif_456",
          recipient_count: 1000,
          campaign_id: "camp_789",
          notification_type: "promotional",
          success_rate: 98.5
        },
        timestamp: "2025-02-11T13:45:00+05:30"
      },
      {
        service: "user_service",
        level: "warn",
        message: "User password expired",
        metadata: {
          user_id: "usr_789",
          last_password_change: "2024-11-11",
          account_type: "premium",
          notification_sent: true
        },
        timestamp: "2025-02-11T13:30:00+05:30"
      },
      {
        service: "analytics_service",
        level: "info",
        message: "Daily metrics calculation completed",
        metadata: {
          process_duration_ms: 45000,
          records_processed: 1000000,
          date_range: "2025-02-10 to 2025-02-11",
          metrics_count: 50
        },
        timestamp: "2025-02-11T13:15:00+05:30"
      },
      {
        service: "email_service",
        level: "error",
        message: "Failed to send bulk emails",
        metadata: {
          batch_id: "batch_123",
          total_emails: 5000,
          failed_count: 150,
          error_type: "SMTP_ERROR",
          retry_scheduled: true
        },
        timestamp: "2025-02-11T13:00:00+05:30"
      },
      {
        service: "search_service",
        level: "info",
        message: "Search index updated",
        metadata: {
          index_name: "products_v2",
          documents_indexed: 5000,
          duration_seconds: 120,
          new_documents: 150,
          updated_documents: 50
        },
        timestamp: "2025-02-11T12:45:00+05:30"
      },
      {
        service: "payment_service",
        level: "warn",
        message: "Unusual transaction pattern detected",
        metadata: {
          user_id: "usr_456",
          transaction_count: 15,
          time_window_minutes: 30,
          risk_score: 0.75,
          flagged_reason: "high_frequency"
        },
        timestamp: "2025-02-11T12:30:00+05:30"
      },
      {
        service: "auth_service",
        level: "info",
        message: "New API key generated",
        metadata: {
          api_key_id: "key_789",
          requesting_user: "admin@company.com",
          permissions: ["read", "write"],
          expiration: "2026-02-11",
          ip_address: "192.168.1.1"
        },
        timestamp: "2025-02-11T12:15:00+05:30"
      },
      {
        service: "database_service",
        level: "error",
        message: "Database replication lag detected",
        metadata: {
          primary_server: "db-primary-01",
          replica_server: "db-replica-02",
          lag_seconds: 300,
          affected_tables: ["users", "orders"],
          critical_threshold_exceeded: true
        },
        timestamp: "2025-02-11T12:00:00+05:30"
      },
      {
        service: "cache_service",
        level: "warn",
        message: "Cache hit ratio below threshold",
        metadata: {
          cache_instance: "redis-01",
          current_ratio: 0.65,
          threshold: 0.80,
          time_window_minutes: 15,
          total_requests: 50000
        },
        timestamp: "2025-02-11T11:45:00+05:30"
      },
      {
        service: "user_service",
        level: "info",
        message: "User profile updated",
        metadata: {
          user_id: "usr_123",
          updated_fields: ["address", "phone"],
          source: "mobile_app",
          app_version: "2.1.0"
        },
        timestamp: "2025-02-11T11:30:00+05:30"
      }
    ];

    setLogs(sampleLogs);
  }, []);

  return { logs, setLogs };
};
