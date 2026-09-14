from kubernetes import client, config

config.load_kube_config()

v1 = client.CoreV1Api()

namespaces = v1.list_namespace()

for namespace in namespaces.items:
    print(namespace.metadata.name)
