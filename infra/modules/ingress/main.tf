resource "kubernetes_ingress_v1" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    ingress_class_name = "traefik"

    rule {
      host = var.client_name != null ? "${var.client_name}.localhost" : null

      http {
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = var.service_name

              port {
                number = var.service_port
              }
            }
          }
        }
      }
    }
  }
}