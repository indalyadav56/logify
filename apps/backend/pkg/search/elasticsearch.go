package search

import (
	"fmt"

	"github.com/elastic/go-elasticsearch/v8"

	"github.com/indalyadav56/logify/apps/backend/pkg/config"
)

// NewElasticsearchClient initializes and returns an Elasticsearch client.
func NewElasticsearchClient(cfg config.ElasticsearchConfig) (*elasticsearch.Client, error) {
	esCfg := elasticsearch.Config{
		Addresses: cfg.Addresses,
	}

	if cfg.Username != "" {
		esCfg.Username = cfg.Username
		esCfg.Password = cfg.Password
	}

	client, err := elasticsearch.NewClient(esCfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create elasticsearch client: %w", err)
	}

	// Verify connectivity
	res, err := client.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping elasticsearch: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("elasticsearch ping returned error: %s", res.Status())
	}

	return client, nil
}
