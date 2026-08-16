output "name" {
  description = "Name of the Service"
  value       = kubernetes_service.this.metadata[0].name
}

output "cluster_ip" {
  description = "Cluster IP of the Service"
  value       = kubernetes_service.this.spec[0].cluster_ip
}