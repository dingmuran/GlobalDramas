package response

import "github.com/dingmuran/GlobalDramasAdmin/server/model/example"

type ExaCustomerResponse struct {
	Customer example.ExaCustomer `json:"customer"`
}
