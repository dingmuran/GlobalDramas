package api

import (
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
)

func maxBody(c *gin.Context) io.ReadCloser {
	return http.MaxBytesReader(c.Writer, c.Request.Body, 2<<20)
}
