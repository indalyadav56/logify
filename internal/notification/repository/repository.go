package repository

import (
	"common/pkg/logger"
	"database/sql"
	"logify/internal/notification/models"
)

type NotificationRepository interface {
	Insert(notification *models.Notification) (*models.Notification, error)
	Update(notification *models.Notification) (*models.Notification, error)
	FindByID(id string) (*models.Notification, error)
	List(page, pageSize int) ([]models.Notification, error)
	Delete(id string) error
}

type notificationRepository struct {
	db  *sql.DB
	log logger.Logger
}

func NewNotificationRepository(db *sql.DB, log logger.Logger) *notificationRepository {
	return &notificationRepository{
		db:  db,
		log: log,
	}
}

// Insert inserts a new record into the database
func (r *notificationRepository) Insert(notification *models.Notification) (*models.Notification, error) {

	return nil, nil

}

// FindByID retrieves a record by its ID from the database
func (r *notificationRepository) FindByID(id string) (*models.Notification, error) {
	// Execute SELECT query to find a record by ID
	// query := "SELECT id, field1, field2 FROM notifications WHERE id = ?"
	// row := r.db.QueryRow(query, id)

	// var notification models.Notification
	// if err := row.Scan(&notification.ID, &notification.Field1, &notification.Field2); err != nil {
	// 	if err == sql.ErrNoRows {
	// 		return nil, nil // No record found
	// 	}
	// 	return nil, err // Other error occurred
	// }

	// return &notification, nil // Return the found record
	return nil, nil
}

// List retrieves a paginated list of records from the database
func (r *notificationRepository) List(page, pageSize int) ([]models.Notification, error) {
	// offset := (page - 1) * pageSize
	// query := "SELECT id, field1, field2 FROM notifications LIMIT ? OFFSET ?"
	// rows, err := r.db.Query(query, pageSize, offset)
	// if err != nil {
	// 	return nil, err
	// }
	// defer rows.Close()

	// var notifications []models.Notification
	// for rows.Next() {
	// 	var notification models.Notification
	// 	if err := rows.Scan(&notification.ID, &notification.Field1, &notification.Field2); err != nil {
	// 		return nil, err
	// 	}
	// 	notifications = append(notifications, notification)
	// }

	// if err := rows.Err(); err != nil {
	// 	return nil, err
	// }

	// return notifications, nil
	return nil, nil
}

// Update updates an existing record in the database
func (r *notificationRepository) Update(notification *models.Notification) (*models.Notification, error) {
	// query := "UPDATE notifications SET field1 = ?, field2 = ? WHERE id = ?"
	// _, err := r.db.Exec(query, notification.Field1, notification.Field2, notification.ID)
	// if err != nil {
	// 	return nil, err
	// }
	// return notification, nil
	return nil, nil
}

// Delete removes a record from the database by ID
func (r *notificationRepository) Delete(id string) error {
	query := "DELETE FROM notifications WHERE id = ?"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}
	return nil
}
