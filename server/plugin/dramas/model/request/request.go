package request

type Page struct {
	ID       uint   `form:"id"`
	Page     int    `form:"page"`
	PageSize int    `form:"pageSize"`
	Search   string `form:"search"`
	Status   string `form:"status"`
	DramaID  uint   `form:"dramaId"`
}
type Action struct {
	Action   string `json:"action"`
	Note     string `json:"note"`
	Evidence string `json:"evidence"`
	Decision bool   `json:"decision"`
	Count    int    `json:"count"`
	Start    int    `json:"start"`
}
type Account struct {
	Username string `json:"username"`
	Password string `json:"password"`
	NickName string `json:"nickName"`
	Role     uint   `json:"role"`
}
type PlaybackEvent struct {
	EpisodeID       uint   `json:"episodeId"`
	Event           string `json:"event"`
	Source          string `json:"source"`
	SessionID       string `json:"sessionId"`
	StartupMs       int64  `json:"startupMs"`
	BufferMs        int64  `json:"bufferMs"`
	ErrorCode       string `json:"errorCode"`
	PositionSeconds int64  `json:"positionSeconds"`
	WatchedSeconds  int64  `json:"watchedSeconds"`
}
