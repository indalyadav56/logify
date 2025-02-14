package handlers

import (
	"common/pkg/logger"
	"common/pkg/response"
	"common/pkg/validator"
	"logify/internal/project/models"
	"logify/internal/project/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ProjectHandler interface {
	Create(c *gin.Context)
	Get(c *gin.Context)
	Update(c *gin.Context)
	Delete(c *gin.Context)

	CreateAPIKey(c *gin.Context)
	DeleteAPIKey(c *gin.Context)
}

type projectHandler struct {
	service   services.ProjectService
	log       logger.Logger
	validator validator.Validator
}

func NewProjectHandler(service services.ProjectService, log logger.Logger, validator validator.Validator) ProjectHandler {
	return &projectHandler{
		service:   service,
		log:       log,
		validator: validator,
	}
}

// @Summary Create a new project
// @Description Create a new project entry
// @Tags project
// @Accept json
// @Produce json
// @Router /v1/projects [post]
func (h *projectHandler) Create(c *gin.Context) {
	tenantID := c.MustGet("tenant_id").(string)
	userID := c.MustGet("user_id").(string)

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		h.log.Error("failed to parse user ID", err)
		c.JSON(400, gin.H{"message": "invalid user ID"})
		return
	}

	tenantUUID, err := uuid.Parse(tenantID)
	if err != nil {
		h.log.Error("failed to parse tenant ID", err)
		c.JSON(400, gin.H{"message": "invalid tenant ID"})
		return
	}

	project := &models.Project{
		Name:        "Test",
		UserID:      userUUID,
		TenantID:    tenantUUID,
		Environment: "dev",
		ApiKey:      "test123",
	}

	result, err := h.service.Create(project)
	if err != nil {
		h.log.Error("failed to create project", err)
		c.JSON(500, gin.H{"message": "failed to create project"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"msg":     "Create",
		"project": result,
	})
}

// @Summary Get project details
// @Description Get details of a project entry
// @Tags project
// @Accept json
// @Produce json
// @Param id path int true "project ID"
// @Router /v1/projects/{id} [get]
func (h *projectHandler) Get(c *gin.Context) {
	// Implementation for Get
}

// @Summary Update project details
// @Description Update details of an existing project entry
// @Tags project
// @Accept json
// @Produce json
// @Param id path int true "project ID"
// @Router /v1/projects/{id} [patch]
func (h *projectHandler) Update(c *gin.Context) {
	// Implementation for Update
}

// @Summary Delete project
// @Description Delete an existing project entry
// @Tags project
// @Accept json
// @Produce json
// @Router /v1/projects/{id} [delete]
func (h *projectHandler) Delete(c *gin.Context) {
	// Implementation for Delete
}

func (h *projectHandler) CreateAPIKey(c *gin.Context) {
	projectID := c.Param("projectID")

	userID := c.MustGet("user_id").(string)
	tenantID := c.MustGet("tenant_id").(string)

	token, err := h.service.CreateAPIKey(userID, tenantID, projectID)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "Create API key", err)
		return
	}

	response.SendSuccess(c, "Create API key", token)
}

func (h *projectHandler) DeleteAPIKey(c *gin.Context) {
	res, err := h.service.DeleteAPIKey("")
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "Delete API key", err)
		return
	}

	response.SendSuccess(c, "Delete API key", res)
}
