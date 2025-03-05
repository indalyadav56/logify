package config

// NavigationItem represents a single navigation menu item
type NavigationItem struct {
	Title string `json:"title"`
	Icon  string `json:"icon"`
	Route string `json:"route"`
}

// GetNavigationConfig returns the navigation configuration for the application
func GetNavigationConfig() []NavigationItem {
	return []NavigationItem{
		{
			Title: "Dashboard",
			Icon:  "dashboard",
			Route: "/dashboard",
		},
		{
			Title: "Logs",
			Icon:  "logs",
			Route: "/logs",
		},
		{
			Title: "User Management",
			Icon:  "users",
			Route: "/users",
		},
		{
			Title: "Settings",
			Icon:  "settings",
			Route: "/settings",
		},
	}
}
