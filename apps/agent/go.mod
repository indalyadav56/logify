module github.com/indalyadav56/logify/apps/agent

go 1.26.3

require (
	github.com/indalyadav56/logify/sdks/go v0.0.0
	gopkg.in/yaml.v3 v3.0.1
)

// Use the SDK from this monorepo rather than a published version.
replace github.com/indalyadav56/logify/sdks/go => ../../sdks/go
