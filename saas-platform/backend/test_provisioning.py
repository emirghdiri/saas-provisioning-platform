from app.services.kubernetes_service import KubernetesService


kubernetes = KubernetesService()

namespace = "python-test"

print("Creating namespace...")

kubernetes.create_namespace(namespace)

print("Creating deployment...")

kubernetes.create_deployment(
    namespace_name=namespace,
    deployment_name="python-test-app",
    image="nginx:latest",
    replicas=2
)

print("Creating service...")

kubernetes.create_service(
    namespace_name=namespace,
    service_name="python-test-service",
    deployment_name="python-test-app"
)

print("Provisioning completed!")
