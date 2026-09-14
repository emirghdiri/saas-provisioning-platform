variable "client_name" {
  description = "Nom du client à provisionner"
  type        = string
}

variable "replicas" {
  description = "Nombre de replicas"
  type        = number
  default     = 2
}

variable "storage" {
  description = "Stockage du client"
  type        = string
  default     = "2Gi"
}

variable "database" {
  description = "Type de base de données"
  type        = string
  default     = "postgresql"
}

variable "docker_image" {
  description = "Image Docker de l'application du tenant"
  type        = string
  default     = "nginx:latest"
}
