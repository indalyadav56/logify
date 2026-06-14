package opensearch

import (
	"github.com/opensearch-project/opensearch-go"
)

var openSearchClient *opensearch.Client

func NewOpensearchClient(url string) (*opensearch.Client, error) {
	openSearchClient, err := opensearch.NewClient(opensearch.Config{
		Addresses: []string{url},
	})
	if err != nil {
		return nil, err
	}

	return openSearchClient, nil
}
