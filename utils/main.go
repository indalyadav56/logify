package utils

// LogInput represents the raw input log structure
type LogInput struct {
	Level         string                 `json:"level"`
	Message       string                 `json:"msg"`
	Timestamp     string                 `json:"time"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
	RequestBody   string                 `json:"request_body,omitempty"`
	RequestHeader string                 `json:"request_header,omitempty"`
	RequestHost   string                 `json:"request_host,omitempty"`
	RequestID     string                 `json:"request_id,omitempty"`
	RequestMethod string                 `json:"request_method,omitempty"`
	RequestURI    string                 `json:"request_uri,omitempty"`
	RequestAgent  string                 `json:"request_user_agent,omitempty"`
	DeviceIP      string                 `json:"device_ip,omitempty"`
	StartTime     string                 `json:"start_time,omitempty"`
}

// LogOutput represents the final structured log for Elasticsearch
type LogOutput struct {
	Level     string                 `json:"level"`
	Message   string                 `json:"message"`
	Service   string                 `json:"service,omitempty"`
	Timestamp string                 `json:"timestamp"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// NormalizeLog converts raw log input to structured Elasticsearch log output
func NormalizeLog(input LogInput) LogOutput {
	// Extract core log fields
	output := LogOutput{
		Level:     input.Level,
		Message:   input.Message,
		Service:   "bank-api",
		Timestamp: input.Timestamp,
		Metadata:  make(map[string]interface{}),
	}

	// Collect additional metadata while avoiding duplicate fields
	if input.RequestBody != "" {
		output.Metadata["request_body"] = input.RequestBody
	}
	if input.RequestHeader != "" {
		output.Metadata["request_header"] = input.RequestHeader
	}
	if input.RequestHost != "" {
		output.Metadata["request_host"] = input.RequestHost
	}
	if input.RequestID != "" {
		output.Metadata["request_id"] = input.RequestID
	}
	if input.RequestMethod != "" {
		output.Metadata["request_method"] = input.RequestMethod
	}
	if input.RequestURI != "" {
		output.Metadata["request_uri"] = input.RequestURI
	}
	if input.RequestAgent != "" {
		output.Metadata["request_user_agent"] = input.RequestAgent
	}
	if input.DeviceIP != "" {
		output.Metadata["device_ip"] = input.DeviceIP
	}
	if input.StartTime != "" {
		output.Metadata["start_time"] = input.StartTime
	}

	return output
}
