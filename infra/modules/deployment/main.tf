resource "kubernetes_deployment" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = var.name
      }
    }

    template {
      metadata {
        labels = {
          app = var.name
        }
      }

      spec {
        container {
          name  = var.name
          image = var.image

          dynamic "volume_mount" {
            for_each = var.pvc_name != null ? [1] : []

            content {
              name       = "app-storage"
              mount_path = "/data"
            }
          }
        }

        dynamic "volume" {
          for_each = var.pvc_name != null ? [1] : []

          content {
            name = "app-storage"

            persistent_volume_claim {
              claim_name = var.pvc_name
            }
          }
        }
      }
    }
  }
}