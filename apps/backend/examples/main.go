package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
)

func main() {

	// token, _ := generateToken()
	// fmt.Println(token)

	b := make([]byte, 1)
	fmt.Println(b)
}

func generateToken() (string, error) {
	b := make([]byte, 16) // 128 bits
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil // 22 chars, URL-safe
}
