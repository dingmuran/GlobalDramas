package request

// ViewerPage deliberately excludes administrative status/owner filters.
type ViewerPage struct {
	Page     int    `form:"page" binding:"omitempty,min=1,max=100000"`
	PageSize int    `form:"pageSize" binding:"omitempty,min=1,max=100"`
	Search   string `form:"search" binding:"max=100"`
}
