resource "kubernetes_persistent_volume_claim" "this" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = var.storage
      }
    }

    storage_class_name = var.storage_class
  }
}