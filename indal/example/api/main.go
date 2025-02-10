package main

import (
	"fmt"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte("your-secret-key")

func generateToken() (string, error) {
	claims := jwt.MapClaims{
		"sub":     "user_id_or_service",
		"iat":     time.Now().Unix(), // Issued at
		"service": "internal-service",
		"":        "internal-service",
		// Do NOT add "exp" to make it non-expiring
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}

func main() {
	token, err := generateToken()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Token:", token)

}
