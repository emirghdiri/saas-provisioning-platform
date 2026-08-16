resource "kubernetes_service" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    selector = var.selector

    port {
      port        = var.port
      target_port = var.target_port
    }

    type = "ClusterIP"
  }
}