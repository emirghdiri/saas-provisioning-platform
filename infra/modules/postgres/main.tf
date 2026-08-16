resource "kubernetes_secret" "postgres" {
  metadata {
    name      = "${var.name}-secret"
    namespace = var.namespace
  }

  type = "Opaque"

  data = {
    POSTGRES_USER     = "admin"
    POSTGRES_PASSWORD = "CHANGE_ME"
    POSTGRES_DB       = "saas"
  }
}

resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "${var.name}-pvc"
    namespace = var.namespace
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = var.storage
      }
    }

    storage_class_name = "local-path"
  }
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    replicas = 1

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
          name  = "postgres"
          image = var.image

          env {
            name = "POSTGRES_USER"

            value_from {
              secret_key_ref {
                name = "${var.name}-secret"
                key  = "POSTGRES_USER"
              }
            }
          }

          env {
            name = "POSTGRES_PASSWORD"

            value_from {
              secret_key_ref {
                name = "${var.name}-secret"
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          env {
            name = "POSTGRES_DB"

            value_from {
              secret_key_ref {
                name = "${var.name}-secret"
                key  = "POSTGRES_DB"
              }
            }
          }

          port {
            container_port = 5432
          }

          volume_mount {
            name       = "postgres-data"
            mount_path = "/var/lib/postgresql/data"
          }
        }

        volume {
          name = "postgres-data"

          persistent_volume_claim {
            claim_name = "${var.name}-pvc"
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  spec {
    selector = {
      app = var.name
    }

    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}