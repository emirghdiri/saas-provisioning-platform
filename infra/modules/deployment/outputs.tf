output "name" {
  description = "Name of the Kubernetes Deployment"
  value       = kubernetes_deployment.this.metadata[0].name
}

output "namespace" {
  description = "Namespace of the Kubernetes Deployment"
  value       = kubernetes_deployment.this.metadata[0].namespace
}