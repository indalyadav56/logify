package main

import (
	"fmt"
	"logify/internal/app"
)

// @title logify API
// @version 1.0
// @description This is a sample server for logify.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /v1
// @schemes http https
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
func main() {
	application, err := app.New()
	if err != nil {
		fmt.Printf("Error creating application: %v\n", err)
		return
	}

	if err := application.Run(); err != nil {
		fmt.Printf("Error running application: %v\n", err)
		return
	}

}
