variable "name" {
  description = "Name of the Kubernetes Deployment"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace where the Deployment will be created"
  type        = string
}

variable "image" {
  description = "Container image to run"
  type        = string
}

variable "replicas" {
  description = "Number of replicas"
  type        = number
  default     = 1
}
variable "pvc_name" {
  description = "Nom du PVC utilisé par le Deployment"
  type        = string
  default     = null
}