from kubernetes import client, config


class KubernetesService:

    def __init__(self):
        config.load_kube_config()

        self.core_api = client.CoreV1Api()
        self.apps_api = client.AppsV1Api()

    def create_namespace(self, namespace_name: str):

        namespace = client.V1Namespace(
            metadata=client.V1ObjectMeta(
                name=namespace_name
            )
        )

        return self.core_api.create_namespace(
            body=namespace
        )

    def create_deployment(
        self,
        namespace_name: str,
        deployment_name: str,
        image: str = "nginx:latest",
        replicas: int = 1
    ):

        container = client.V1Container(
            name=deployment_name,
            image=image,
            ports=[
                client.V1ContainerPort(
                    container_port=80
                )
            ]
        )

        template = client.V1PodTemplateSpec(
            metadata=client.V1ObjectMeta(
                labels={
                    "app": deployment_name
                }
            ),
            spec=client.V1PodSpec(
                containers=[container]
            )
        )

        spec = client.V1DeploymentSpec(
            replicas=replicas,
            selector=client.V1LabelSelector(
                match_labels={
                    "app": deployment_name
                }
            ),
            template=template
        )

        deployment = client.V1Deployment(
            metadata=client.V1ObjectMeta(
                name=deployment_name
            ),
            spec=spec
        )

        return self.apps_api.create_namespaced_deployment(
            namespace=namespace_name,
            body=deployment
        )

    def create_service(
        self,
        namespace_name: str,
        service_name: str,
        deployment_name: str
    ):

        service = client.V1Service(
            metadata=client.V1ObjectMeta(
                name=service_name
            ),
            spec=client.V1ServiceSpec(
                selector={
                    "app": deployment_name
                },
                ports=[
                    client.V1ServicePort(
                        port=80,
                        target_port=80
                    )
                ],
                type="ClusterIP"
            )
        )

        return self.core_api.create_namespaced_service(
            namespace=namespace_name,
            body=service
        )
