variable "client_name" {
  description = "Nom du client"
  type        = string
}

variable "replicas" {
  description = "Nombre de replicas de l'application du client"
  type        = number
  default     = 1
}

variable "storage" {
  description = "Taille du stockage du client"
  type        = string
  default     = "1Gi"
}

variable "database" {
  description = "Type de base de données"
  type        = string
  default     = "postgresql"
}