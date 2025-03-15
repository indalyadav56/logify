package services

import (
	"fmt"
	"logify/internal/log/dto"
)

// BuildElasticsearchQuery constructs the Elasticsearch query from LogSearchRequest
func BuildElasticsearchQueryWitMapping(req *dto.LogSearchRequest) (map[string]interface{}, error) {
	mustClauses := []map[string]interface{}{}

	// Add case-insensitive wildcard search for messages
	if len(req.MessageContains) > 0 {
		queryStr := ""
		for i, msg := range req.MessageContains {
			if i > 0 {
				queryStr += " OR "
			}
			queryStr += fmt.Sprintf("(?i)*%s*", msg) // Case-insensitive wildcard match
		}
		mustClauses = append(mustClauses, map[string]interface{}{
			"query_string": map[string]interface{}{
				"query":            queryStr,
				"analyze_wildcard": true,
			},
		})
	}

	// Add filter for services
	if len(req.Services) > 0 {
		mustClauses = append(mustClauses, map[string]interface{}{
			"terms": map[string]interface{}{
				"service": req.Services,
			},
		})
	}

	// Add filter for levels
	if len(req.Levels) > 0 {
		mustClauses = append(mustClauses, map[string]interface{}{
			"terms": map[string]interface{}{
				"level": req.Levels,
			},
		})
	}

	// Add timestamp range filter
	if req.TimestampRange.From != "" && req.TimestampRange.To != "" {
		mustClauses = append(mustClauses, map[string]interface{}{
			"range": map[string]interface{}{
				"timestamp": map[string]interface{}{
					"gte":    req.TimestampRange.From, // Greater than or equal to `from`
					"lte":    req.TimestampRange.To,   // Less than or equal to `to`
					"format": "strict_date_optional_time",
				},
			},
		})
	}

	// Add metadata filters (key-value pairs)
	for key, value := range req.Metadata {
		mustClauses = append(mustClauses, map[string]interface{}{
			"match": map[string]interface{}{
				fmt.Sprintf("metadata.%s", key): value,
			},
		})
	}

	// **Add required project_id filter**
	if req.ProjectID != "" {
		mustClauses = append(mustClauses, map[string]interface{}{
			"term": map[string]interface{}{
				"project_id": req.ProjectID,
			},
		})
	}

	// **Add required tenant_id filter**
	if req.TenantID != "" {
		mustClauses = append(mustClauses, map[string]interface{}{
			"term": map[string]interface{}{
				"tenant_id": req.TenantID,
			},
		})
	}

	// Set default sorting field & order
	sortBy := "timestamp"
	if req.Sort != "" {
		sortBy = req.Sort // Use user-defined field
	}

	sortOrder := "desc" // Default order
	if req.Order == "asc" {
		sortOrder = "asc"
	}

	// Set default pagination values
	page := req.Page
	if page < 1 {
		page = 1
	}
	size := req.Limit
	if size <= 0 {
		size = 10 // Default to 10 results per page
	}
	from := (page - 1) * size // Calculate "from" for pagination

	// Construct the final Elasticsearch query
	query := map[string]interface{}{
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must": mustClauses,
			},
		},
		"sort": []map[string]interface{}{
			{
				sortBy: map[string]interface{}{
					"order": sortOrder,
				},
			},
		},
		"from": from, // Pagination start index
		"size": size, // Number of results per page
	}

	return query, nil
}
