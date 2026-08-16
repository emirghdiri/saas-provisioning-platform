variable "namespace_name" {
  description = "Nom du namespace"
  type        = string
}

variable "labels" {
  description = "Labels du namespace"
  type        = map(string)
  default     = {}
}