package dto

import "common/types"

type UserResponse struct {
	ID         string               `json:"id"`
	FirstName  types.NullableString `json:"first_name"`
	MiddleName types.NullableString `json:"middle_name"`
	LastName   types.NullableString `json:"last_name"`
	Email      string               `json:"email"`
}
