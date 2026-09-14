variable "name" {
  type = string
}

variable "namespace" {
  type = string
}

variable "service_name" {
  type = string
}

variable "service_port" {
  type = number
}

variable "client_name" {
  type    = string
  default = null
}