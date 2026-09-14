variable "name" {
  type = string
}

variable "namespace" {
  type = string
}

variable "port" {
  type = number
}

variable "target_port" {
  type = number
}

variable "selector" {
  type = map(string)
}