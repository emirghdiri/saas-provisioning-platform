variable "name" {
  description = "Name of the Kubernetes Service"
  type        = string
}

variable "namespace" {
  description = "Namespace of the Service"
  type        = string
}

variable "port" {
  description = "Service port"
  type        = number
}

variable "target_port" {
  description = "Container port targeted by the Service"
  type        = number
}

variable "selector" {
  description = "Labels used to select Pods"
  type        = map(string)
}