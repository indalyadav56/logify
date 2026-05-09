package http

import (
	"github.com/gin-gonic/gin"
	"github.com/indalyadav56/logify/apps/backend/pkg/response"
)

// NotificationDashboardHandler handles notification channels, alert rules, and notifications.
type NotificationDashboardHandler interface {
	// Notification channels
	ListChannels(c *gin.Context)
	CreateChannel(c *gin.Context)
	GetChannel(c *gin.Context)
	UpdateChannel(c *gin.Context)
	DeleteChannel(c *gin.Context)
	TestChannel(c *gin.Context)

	// Alert rules
	ListAlertRules(c *gin.Context)
	CreateAlertRule(c *gin.Context)
	GetAlertRule(c *gin.Context)
	UpdateAlertRule(c *gin.Context)
	DeleteAlertRule(c *gin.Context)
	EnableAlertRule(c *gin.Context)
	DisableAlertRule(c *gin.Context)

	// Notifications
	ListNotifications(c *gin.Context)
	GetNotification(c *gin.Context)
	AcknowledgeNotification(c *gin.Context)
	ResolveNotification(c *gin.Context)
}

type notificationDashboardHandler struct{}

func NewNotificationDashboardHandler() NotificationDashboardHandler {
	return &notificationDashboardHandler{}
}

// ── Notification Channels ────────────────────────────────────────────────────

var mockChannels = []gin.H{
	{
		"id":         "ch_01jv4slack001",
		"name":       "Engineering Alerts",
		"type":       "slack",
		"enabled":    true,
		"config":     gin.H{"webhook_url": "https://hooks.slack.com/services/T000/B000/xxxx", "channel": "#alerts"},
		"created_at": "2026-01-10T09:00:00Z",
		"updated_at": "2026-03-15T12:00:00Z",
	},
	{
		"id":         "ch_01jv4email001",
		"name":       "On-Call Email",
		"type":       "email",
		"enabled":    true,
		"config":     gin.H{"recipients": []string{"oncall@example.com", "lead@example.com"}},
		"created_at": "2026-01-12T11:00:00Z",
		"updated_at": "2026-01-12T11:00:00Z",
	},
	{
		"id":         "ch_01jv4webhook001",
		"name":       "PagerDuty Webhook",
		"type":       "webhook",
		"enabled":    false,
		"config":     gin.H{"url": "https://events.pagerduty.com/integration/abc/enqueue", "secret": "***"},
		"created_at": "2026-02-05T14:30:00Z",
		"updated_at": "2026-04-01T08:00:00Z",
	},
}

// ListChannels handles GET /v1/notification-channels
func (h *notificationDashboardHandler) ListChannels(c *gin.Context) {
	response.OK(c, "Notification channels retrieved", mockChannels)
}

// CreateChannel handles POST /v1/notification-channels
func (h *notificationDashboardHandler) CreateChannel(c *gin.Context) {
	response.Created(c, "Notification channel created", gin.H{
		"id":         "ch_01jv4new999",
		"name":       "New Channel",
		"type":       "slack",
		"enabled":    true,
		"config":     gin.H{},
		"created_at": "2026-05-07T10:00:00Z",
		"updated_at": "2026-05-07T10:00:00Z",
	})
}

// GetChannel handles GET /v1/notification-channels/:id
func (h *notificationDashboardHandler) GetChannel(c *gin.Context) {
	id := c.Param("id")
	for _, ch := range mockChannels {
		if ch["id"] == id {
			response.OK(c, "Notification channel retrieved", ch)
			return
		}
	}
	response.OK(c, "Notification channel retrieved", mockChannels[0])
}

// UpdateChannel handles PATCH /v1/notification-channels/:id
func (h *notificationDashboardHandler) UpdateChannel(c *gin.Context) {
	id := c.Param("id")
	response.OK(c, "Notification channel updated", gin.H{
		"id":         id,
		"updated_at": "2026-05-07T10:00:00Z",
	})
}

// DeleteChannel handles DELETE /v1/notification-channels/:id
func (h *notificationDashboardHandler) DeleteChannel(c *gin.Context) {
	response.NoContent(c)
}

// TestChannel handles POST /v1/notification-channels/:id/test
func (h *notificationDashboardHandler) TestChannel(c *gin.Context) {
	response.OK(c, "Test notification sent successfully", gin.H{
		"delivered": true,
		"sent_at":   "2026-05-07T10:00:00Z",
	})
}

// ── Alert Rules ──────────────────────────────────────────────────────────────

var mockAlertRules = []gin.H{
	{
		"id":          "rule_01jv4err001",
		"name":        "High Error Rate",
		"description": "Triggers when error rate exceeds 5% over 5 minutes",
		"enabled":     true,
		"condition": gin.H{
			"metric":    "error_rate",
			"operator":  "gt",
			"threshold": 5.0,
			"window":    "5m",
		},
		"channels":   []string{"ch_01jv4slack001", "ch_01jv4email001"},
		"severity":   "critical",
		"created_at": "2026-01-20T10:00:00Z",
		"updated_at": "2026-04-10T08:00:00Z",
	},
	{
		"id":          "rule_01jv4latency001",
		"name":        "P99 Latency Spike",
		"description": "Triggers when p99 latency exceeds 2000ms",
		"enabled":     true,
		"condition": gin.H{
			"metric":    "p99_latency_ms",
			"operator":  "gt",
			"threshold": 2000,
			"window":    "10m",
		},
		"channels":   []string{"ch_01jv4slack001"},
		"severity":   "warning",
		"created_at": "2026-02-01T09:00:00Z",
		"updated_at": "2026-02-01T09:00:00Z",
	},
	{
		"id":          "rule_01jv4disk001",
		"name":        "Disk Usage Warning",
		"description": "Triggers when disk usage exceeds 80%",
		"enabled":     false,
		"condition": gin.H{
			"metric":    "disk_usage_pct",
			"operator":  "gt",
			"threshold": 80,
			"window":    "1m",
		},
		"channels":   []string{"ch_01jv4email001"},
		"severity":   "warning",
		"created_at": "2026-03-05T11:00:00Z",
		"updated_at": "2026-04-20T15:30:00Z",
	},
}

// ListAlertRules handles GET /v1/alert-rules
func (h *notificationDashboardHandler) ListAlertRules(c *gin.Context) {
	response.OK(c, "Alert rules retrieved", mockAlertRules)
}

// CreateAlertRule handles POST /v1/alert-rules
func (h *notificationDashboardHandler) CreateAlertRule(c *gin.Context) {
	response.Created(c, "Alert rule created", gin.H{
		"id":          "rule_01jv4new999",
		"name":        "New Alert Rule",
		"enabled":     true,
		"severity":    "warning",
		"created_at":  "2026-05-07T10:00:00Z",
		"updated_at":  "2026-05-07T10:00:00Z",
	})
}

// GetAlertRule handles GET /v1/alert-rules/:id
func (h *notificationDashboardHandler) GetAlertRule(c *gin.Context) {
	id := c.Param("id")
	for _, r := range mockAlertRules {
		if r["id"] == id {
			response.OK(c, "Alert rule retrieved", r)
			return
		}
	}
	response.OK(c, "Alert rule retrieved", mockAlertRules[0])
}

// UpdateAlertRule handles PATCH /v1/alert-rules/:id
func (h *notificationDashboardHandler) UpdateAlertRule(c *gin.Context) {
	id := c.Param("id")
	response.OK(c, "Alert rule updated", gin.H{
		"id":         id,
		"updated_at": "2026-05-07T10:00:00Z",
	})
}

// DeleteAlertRule handles DELETE /v1/alert-rules/:id
func (h *notificationDashboardHandler) DeleteAlertRule(c *gin.Context) {
	response.NoContent(c)
}

// EnableAlertRule handles POST /v1/alert-rules/:id/enable
func (h *notificationDashboardHandler) EnableAlertRule(c *gin.Context) {
	id := c.Param("id")
	response.OK(c, "Alert rule enabled", gin.H{
		"id":         id,
		"enabled":    true,
		"updated_at": "2026-05-07T10:00:00Z",
	})
}

// DisableAlertRule handles POST /v1/alert-rules/:id/disable
func (h *notificationDashboardHandler) DisableAlertRule(c *gin.Context) {
	id := c.Param("id")
	response.OK(c, "Alert rule disabled", gin.H{
		"id":         id,
		"enabled":    false,
		"updated_at": "2026-05-07T10:00:00Z",
	})
}

// ── Notifications ────────────────────────────────────────────────────────────

var mockNotifications = []gin.H{
	{
		"id":           "notif_01jv4a001",
		"rule_id":      "rule_01jv4err001",
		"rule_name":    "High Error Rate",
		"severity":     "critical",
		"status":       "firing",
		"message":      "Error rate is 8.3% (threshold: 5%) over the last 5 minutes",
		"triggered_at": "2026-05-07T08:45:00Z",
		"acknowledged": false,
		"resolved":     false,
	},
	{
		"id":              "notif_01jv4b002",
		"rule_id":         "rule_01jv4latency001",
		"rule_name":       "P99 Latency Spike",
		"severity":        "warning",
		"status":          "acknowledged",
		"message":         "P99 latency is 2340ms (threshold: 2000ms) over the last 10 minutes",
		"triggered_at":    "2026-05-06T22:10:00Z",
		"acknowledged":    true,
		"acknowledged_by": "usr_01jv4kqz8p3e5f7g9m2n",
		"acknowledged_at": "2026-05-06T22:15:00Z",
		"resolved":        false,
	},
	{
		"id":           "notif_01jv4c003",
		"rule_id":      "rule_01jv4err001",
		"rule_name":    "High Error Rate",
		"severity":     "critical",
		"status":       "resolved",
		"message":      "Error rate returned to normal (2.1%)",
		"triggered_at": "2026-05-05T14:00:00Z",
		"acknowledged": true,
		"resolved":     true,
		"resolved_at":  "2026-05-05T14:30:00Z",
	},
}

// ListNotifications handles GET /v1/notifications
func (h *notificationDashboardHandler) ListNotifications(c *gin.Context) {
	response.OK(c, "Notifications retrieved", mockNotifications)
}

// GetNotification handles GET /v1/notifications/:id
func (h *notificationDashboardHandler) GetNotification(c *gin.Context) {
	id := c.Param("id")
	for _, n := range mockNotifications {
		if n["id"] == id {
			response.OK(c, "Notification retrieved", n)
			return
		}
	}
	response.OK(c, "Notification retrieved", mockNotifications[0])
}

// AcknowledgeNotification handles POST /v1/notifications/:id/acknowledge
func (h *notificationDashboardHandler) AcknowledgeNotification(c *gin.Context) {
	id := c.Param("id")
	response.OK(c, "Notification acknowledged", gin.H{
		"id":              id,
		"acknowledged":    true,
		"acknowledged_by": "usr_01jv4kqz8p3e5f7g9m2n",
		"acknowledged_at": "2026-05-07T10:00:00Z",
	})
}

// ResolveNotification handles POST /v1/notifications/:id/resolve
func (h *notificationDashboardHandler) ResolveNotification(c *gin.Context) {
	id := c.Param("id")
	response.OK(c, "Notification resolved", gin.H{
		"id":          id,
		"resolved":    true,
		"resolved_at": "2026-05-07T10:00:00Z",
	})
}
