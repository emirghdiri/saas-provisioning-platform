module "namespace" {
  source = "../namespace"

  namespace_name = "tenant-${var.client_name}"

  labels = {
    tenant     = var.client_name
    managed-by = "terraform"
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
  image     = var.docker_image
  replicas  = var.replicas
  pvc_name  = "app-pvc"
}

module "service" {
  source = "../service"

  name        = "app"
  namespace   = module.namespace.namespace_name
  port        = 80
  target_port = 80

  selector = {
    app = "app"
  }
}

module "ingress" {
  source = "../ingress"

  name         = "app-ingress"
  namespace    = module.namespace.namespace_name
  service_name = "app"
  service_port = 80
  client_name  = var.client_name
}

module "postgres" {
  source   = "../postgres"
  name     = "postgres"
  namespace = module.namespace.namespace_name
  storage  = var.storage
  database = var.database
}
