variable "name" {
  description = "Name of the Secret"
  type        = string
}

variable "namespace" {
  description = "Namespace of the Secret"
  type        = string
}

variable "data" {
  description = "Sensitive data"
  type        = map(string)
  sensitive   = true
}