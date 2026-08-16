output "name" {
  value = kubernetes_config_map.this.metadata[0].name
}