output "namespace" {
  description = "Namespace créé pour le client"
  value       = module.namespace.namespace_name
}

output "client_name" {
  description = "Nom du client"
  value       = var.client_name
}