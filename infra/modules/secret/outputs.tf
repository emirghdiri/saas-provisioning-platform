output "name" {
  value = kubernetes_secret.this.metadata[0].name
}