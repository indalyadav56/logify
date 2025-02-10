// // package main

// // import (
// // 	"fmt"
// // 	"io"
// // 	"net/http"
// // )

// // func handler(w http.ResponseWriter, r *http.Request) {
// // 	// Read only up to Content-Length bytes
// // 	body := make([]byte, r.ContentLength)
// // 	n, err := r.Body.Read(body)
// // 	if err != nil && err != io.EOF {
// // 		http.Error(w, "Failed to read body", http.StatusInternalServerError)
// // 		return
// // 	}

// // 	fmt.Printf("Expected Content-Length: %d, Read: %d bytes\n", r.ContentLength, n)
// // 	fmt.Printf("Received Body: %q\n", string(body))

// // 	w.WriteHeader(http.StatusOK)
// // 	w.Write([]byte("Received\n"))
// // }

// // func main() {
// // 	http.HandleFunc("/", handler)
// // 	fmt.Println("Server running on :8080")
// // 	http.ListenAndServe(":8080", nil)
// // }

// package main

// import (
// 	"fmt"
// 	"io"
// 	"net/http"
// 	"strings"
// )

// func main() {

// 	url := "http://localhost:8080/v1/logs"
// 	method := "POST"

// 	payload := strings.NewReader(`{
//   "company_id": "123",
//   "service": "auth-service",
//   "level": "ERROR",
//   "message": "User login failed",
//   "timestamp": "2025-01-07T09:53:01.298432+05:30",
//   "metadata": {
//       "action": "MIDDLEWARE_START",
//       "device_ip": "test",
//       "lat_long": "test,test",
//       "log_level": "info",
//       "line": 229,
//       "msg": "middleware start log",
//       "request_header": "{\n  \"Accept\": \"*/*\",\n  \"Accept-Encoding\": \"gzip, deflate, br\",\n  \"Authorization\": \"Bearer <redacted>\",\n  \"Connection\": \"keep-alive\",\n  \"Postman-Token\": \"52fd243c-2ebb-4b8f-9e63-d710d20e1b2e\",\n  \"User-Agent\": \"PostmanRuntime/7.43.0\",\n  \"X-Device-Ip\": \"test\",\n  \"X-Lat-Long\": \"test,test\",\n  \"X-Os\": \"test\",\n  \"X-Os-Version\": \"test\"\n}",
//       "request_host": "localhost:4100",
//       "request_id": "c2864fb7-9591-4dd2-98d2-9b8578571aac",
//       "request_method": "GET",
//       "request_uri": "/api/transaction/recent-users",
//       "request_user_agent": "PostmanRuntime/7.43.0",
//       "start_time": "2025-01-07T09:53:01.298432+05:30",
//       "user_id": "77e7924e-ced8-4"
//   }
// }
// `)

// 	for i := 0; i < 100; i++ {
// 		fmt.Println(payload)
// 		client := &http.Client{}
// 		req, err := http.NewRequest(method, url, payload)

// 		if err != nil {
// 			fmt.Println(err)
// 			return
// 		}
// 		req.Header.Add("Content-Type", "application/json")

// 		res, err := client.Do(req)
// 		if err != nil {
// 			fmt.Println(err)
// 			return
// 		}
// 		defer res.Body.Close()

// 		body, err := io.ReadAll(res.Body)
// 		if err != nil {
// 			fmt.Println(err)
// 			return
// 		}
// 		fmt.Println(string(body))
// 	}
// }

package main

import (
	"context"
	"fmt"
	logify "logify/indal/example/client"
)

func main() {
	// Basic usage
	client := logify.NewClient(logify.Config{
		ServiceName: "AUTH_SERVICE",
	})

	// Log without worrying about errors
	client.Info(context.Background(), "User logged in", map[string]interface{}{
		"user_id": "123",
	})

	// Log without worrying about errors
	client.Trace(context.Background(), "User logged in", map[string]interface{}{
		"user_id": "123",
	})

	// Log without worrying about errors
	client.Debug(context.Background(), "User logged in", map[string]interface{}{
		"user_id": "123",
	})

	// Log without worrying about errors
	client.Error(context.Background(), "User logged in", map[string]interface{}{
		"user_id": "123",
	})

	// Optional: Custom error handling
	client.SetErrorHandler(func(err error) {
		// Send to Sentry, notify Slack, etc.
		fmt.Printf("Custom error handler: %v\n", err)
	})
}
