variable "name" {
  description = "PostgreSQL deployment name"
  type        = string
}

variable "namespace" {
  description = "Namespace"
  type        = string
}

variable "image" {
  description = "PostgreSQL image"
  type        = string
  default     = "postgres:16"
}

variable "storage" {
  description = "Database storage"
  type        = string
  default     = "1Gi"
}