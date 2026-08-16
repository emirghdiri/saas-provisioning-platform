module "platform_namespace" {

  source = "../../modules/namespace"

  namespace_name = "platform"

  labels = {
    environment = "local"
    managed-by  = "terraform"
  }

}
module "platform_deployment" {
  source = "../../modules/deployment"

  name      = "platform-backend"
  namespace = "platform"
  image     = "nginx:latest"
  replicas  = 2
}
module "platform_service" {
  source = "../../modules/service"

  name        = "platform-backend"
  namespace   = "platform"
  port        = 80
  target_port = 80

  selector = {
    app = "platform-backend"
  }
}
module "platform_config" {
  source = "../../modules/configmap"

  name      = "platform-config"
  namespace = "platform"

  data = {
    APP_NAME = "SaaS Provisioning Platform"
    ENV      = "local"
  }
}
module "platform_postgres" {
  source = "../../modules/postgres"

  name      = "platform-postgres"
  namespace = "platform"
  storage   = "1Gi"
}
module "platform_ingress" {
  source = "../../modules/ingress"

  name         = "platform-ingress"
  namespace    = "platform"
  service_name = "platform-backend"
  service_port = 80
}
module "tenant_acme" {
  source = "../../modules/tenant"

  client_name = "acme"
  replicas    = 2
  storage     = "2Gi"
  database    = "postgresql"
}