module "platform_namespace" {

  source = "../../modules/namespace"

  namespace_name = "platform"

  labels = {
    environment = "local"
    managed-by  = "terraform"
  }

}