resource "kubernetes_secret" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  type = "Opaque"

  data = var.data
}