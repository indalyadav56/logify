package server

// // readinessHandler checks dependencies. Returns 503 if any are down,
// // causing Kubernetes to remove the pod from the service load balancer
// // (without restarting it).
// func readinessHandler(container *di.Container) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
// 		defer cancel()

// 		checks := map[string]string{}
// 		ready := true

// 		// Check Postgres
// 		if err := container.DB.PingContext(ctx); err != nil {
// 			checks["postgres"] = "down: " + err.Error()
// 			ready = false
// 		} else {
// 			checks["postgres"] = "ok"
// 		}

// 		// Check Redis
// 		if err := container.Redis.Ping(ctx).Err(); err != nil {
// 			checks["redis"] = "down: " + err.Error()
// 			ready = false
// 		} else {
// 			checks["redis"] = "ok"
// 		}

// 		// Kafka writer doesn't have a Ping equivalent — track it via metrics instead
// 		checks["kafka"] = "ok"

// 		status := http.StatusOK
// 		statusText := "ready"
// 		if !ready {
// 			status = http.StatusServiceUnavailable
// 			statusText = "not_ready"
// 		}

// 		c.JSON(status, gin.H{
// 			"status": statusText,
// 			"checks": checks,
// 		})
// 	}
// }
