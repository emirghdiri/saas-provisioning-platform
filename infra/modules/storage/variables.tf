variable "name" {
  description = "Name of the PVC"
  type        = string
}

variable "namespace" {
  description = "Namespace of the PVC"
  type        = string
}

variable "storage" {
  description = "Requested storage size"
  type        = string
}

variable "storage_class" {
  description = "StorageClass name"
  type        = string
  default     = "local-path"
}