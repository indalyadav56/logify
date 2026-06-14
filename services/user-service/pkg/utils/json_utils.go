package utils

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"

	"github.com/indalyadav56/logify/services/user-service/pkg/response"
)

var (
	ErrEmptyBody  = errors.New("request body is empty")
	ErrBadPayload = errors.New("invalid JSON payload")
)

func WriteJSON(w http.ResponseWriter, status int, resp response.APIResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		slog.Error(err.Error())
	}
}

func DecodeJSON(r *http.Request, dst interface{}) error {
	if r.Body == nil {
		return ErrEmptyBody
	}
	defer r.Body.Close()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	if len(body) == 0 {
		return ErrEmptyBody
	}

	if err := json.Unmarshal(body, dst); err != nil {
		return ErrBadPayload
	}

	return nil
}
