variable "name" {
  description = "Name of the ConfigMap"
  type        = string
}

variable "namespace" {
  description = "Namespace of the ConfigMap"
  type        = string
}

variable "data" {
  description = "Configuration data"
  type        = map(string)
}