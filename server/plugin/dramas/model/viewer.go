package model

// Viewer DTOs intentionally omit ownership, review notes, proofs and video URLs.
type ViewerDrama struct {
	ID            uint   `json:"id"`
	Title         string `json:"title"`
	Synopsis      string `json:"synopsis"`
	CoverUrl      string `json:"coverUrl"`
	Genre         string `json:"genre"`
	Language      string `json:"language"`
	Region        string `json:"region"`
	TotalEpisodes int64  `json:"totalEpisodes"`
}
type ViewerEpisode struct {
	ID              uint   `json:"id"`
	DramaId         int64  `json:"dramaId"`
	Number          int64  `json:"number"`
	Title           string `json:"title"`
	DurationSeconds int64  `json:"durationSeconds"`
}
type ViewerDramaPage struct {
	List     []ViewerDrama `json:"list"`
	Total    int64         `json:"total"`
	Page     int           `json:"page"`
	PageSize int           `json:"pageSize"`
}
type ViewerEpisodePage struct {
	List     []ViewerEpisode `json:"list"`
	Total    int64           `json:"total"`
	Page     int             `json:"page"`
	PageSize int             `json:"pageSize"`
}
