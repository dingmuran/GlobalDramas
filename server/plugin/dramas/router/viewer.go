package router

import "github.com/gin-gonic/gin"

type ViewerRouter struct{}

// InitPublic only registers public catalogue reads, never administrative CRUD.
func (ViewerRouter) InitPublic(g *gin.RouterGroup) {
	r := g.Group("viewer/v1")
	r.GET("health", viewerApi.Health)
	r.GET("dramas", viewerApi.Dramas)
	r.GET("dramas/:id", viewerApi.Detail)
	r.GET("dramas/:id/episodes", viewerApi.Episodes)
}
