// package main

// import (
// 	"encoding/json"
// 	"fmt"
// 	"html/template"
// 	"net/http"
// 	"os/exec"
// 	"strings"
// 	"time"
// )

// type Service struct {
// 	Name        string    `json:"name"`
// 	Status      string    `json:"status"`
// 	LastUpdated time.Time `json:"last_updated"`
// }

// func getSystemServices() []Service {
// 	cmd := exec.Command("launchctl", "list")
// 	output, err := cmd.Output()
// 	if err != nil {
// 		fmt.Printf("Error getting services: %v\n", err)
// 		return nil
// 	}

// 	lines := strings.Split(string(output), "\n")
// 	services := []Service{}

// 	// Skip header line
// 	for _, line := range lines[1:] {
// 		fields := strings.Fields(line)
// 		if len(fields) >= 3 {
// 			serviceName := fields[2]
// 			// Filter only relevant services (customize this list as needed)
// 			if strings.Contains(serviceName, "com.apple") || strings.Contains(serviceName, "system") {
// 				status := "Running"
// 				if fields[0] == "-" {
// 					status = "Not Running"
// 				}
// 				services = append(services, Service{
// 					Name:        serviceName,
// 					Status:      status,
// 					LastUpdated: time.Now(),
// 				})
// 			}
// 		}
// 	}

// 	return services
// }

// func servicesHandler(w http.ResponseWriter, r *http.Request) {
// 	services := getSystemServices()
// 	if r.Header.Get("HX-Request") == "true" {
// 		// Return only the table body for HTMX requests
// 		tmpl := template.Must(template.ParseFiles("web/templates/index.html"))
// 		tmpl.ExecuteTemplate(w, "services-list", services)
// 	} else {
// 		// Return full page for regular requests
// 		json.NewEncoder(w).Encode(services)
// 	}
// }

// func main() {
// 	// http.HandleFunc("/services", servicesHandler)
// 	// fmt.Println("Server starting on :8085...")
// 	// http.ListenAndServe(":8085", nil)
// }

package main

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/shirou/gopsutil/process"
)

func listAllProcesses() {
	processes, err := process.Processes()
	if err != nil {
		log.Fatalf("Error fetching process list: %v", err)
	}

	fmt.Printf("%-10s %-30s %-10s %-10s\n", "PID", "Process Name", "CPU%", "Memory MB")
	fmt.Println(strings.Repeat("-", 60))

	for _, p := range processes {
		name, err := p.Name()
		if err != nil {
			name = "Unknown"
		}

		cpuPercent, err := p.CPUPercent()
		if err != nil {
			cpuPercent = 0.0
		}

		memInfo, err := p.MemoryInfo()
		if err != nil {
			memInfo = &process.MemoryInfoStat{}
		}

		fmt.Printf("%-10d %-30s %-10.2f %-10.2f\n",
			p.Pid, name, cpuPercent, float64(memInfo.RSS)/(1024*1024)) // Convert bytes to MB
	}
}

func main() {
	// Give processes time to start before measuring CPU usage
	time.Sleep(1 * time.Second)

	listAllProcesses()
}
