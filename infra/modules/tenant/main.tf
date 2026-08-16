module "namespace" {
  source = "../namespace"

  namespace_name = "tenant-${var.client_name}"

  labels = {
    "tenant"     = var.client_name
    "managed-by" = "terraform"
  }
}

module "config" {
  source = "../configmap"

  name      = "app-config"
  namespace = module.namespace.namespace_name

  data = {
    CLIENT_NAME = var.client_name
    DATABASE    = var.database
  }
}

module "storage" {
  source = "../storage"

  name          = "app-pvc"
  namespace     = module.namespace.namespace_name
  storage       = var.storage
  storage_class = "local-path"
}
module "deployment" {
  source = "../deployment"

  name      = "app"
  namespace = module.namespace.namespace_name
  image     = "nginx:latest"
  replicas  = var.replicas
  pvc_name  = "app-pvc"
}