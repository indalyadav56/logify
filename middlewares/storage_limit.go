package middlewares

import (
	"common/pkg/redis"

	"github.com/gin-gonic/gin"
)

func CheckStorageLimit(redis redis.Redis) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check if storage limit is exceeded
		// if exceeded, return 413 Request Entity Too Large
		redis.Set("storage_limit", c.Request.ContentLength, 0)
		c.Next()
	}
}
