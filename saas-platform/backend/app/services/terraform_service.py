import shutil
import subprocess
from pathlib import Path

INFRA_DIR = (
    Path(__file__).resolve().parents[4]
    / "infra"
)

TENANTS_DIR = INFRA_DIR / "tenants"
MODULE_PATH = "../../modules/tenant"


def create_tenant_files(
    client_name: str,
    replicas: int,
    storage: str,
    database: str,
    docker_image: str,
):
    tenant_dir = TENANTS_DIR / client_name
    tenant_dir.mkdir(parents=True, exist_ok=True)

    main_tf = f'''terraform {{
  required_providers {{
    kubernetes = {{
      source = "hashicorp/kubernetes"
    }}
  }}
}}

provider "kubernetes" {{
  config_path = "~/.kube/config"
}}

module "tenant" {{
  source = "{MODULE_PATH}"

  client_name  = var.client_name
  replicas     = var.replicas
  storage      = var.storage
  database     = var.database
  docker_image = var.docker_image
}}
'''

    variables_tf = f'''variable "client_name" {{
  type    = string
  default = "{client_name}"
}}

variable "replicas" {{
  type    = number
  default = {replicas}
}}

variable "storage" {{
  type    = string
  default = "{storage}"
}}

variable "database" {{
  type    = string
  default = "{database}"
}}

variable "docker_image" {{
  type    = string
  default = "{docker_image}"
}}
'''

    (tenant_dir / "main.tf").write_text(main_tf)
    (tenant_dir / "variables.tf").write_text(variables_tf)

    return tenant_dir


def provision_tenant(
    client_name: str,
    replicas: int = 1,
    storage: str = "2Gi",
    database: str = "postgresql",
    docker_image: str = "nginx:latest",
):
    tenant_dir = create_tenant_files(
        client_name,
        replicas,
        storage,
        database,
        docker_image,
    )

    try:
        init_result = subprocess.run(
            ["terraform", "init"],
            cwd=tenant_dir,
            capture_output=True,
            text=True,
            timeout=300,
        )

        if init_result.returncode != 0:
            return {
                "success": False,
                "message": "Terraform init failed",
                "stdout": init_result.stdout,
                "stderr": init_result.stderr,
            }

        apply_result = subprocess.run(
            ["terraform", "apply", "-auto-approve"],
            cwd=tenant_dir,
            capture_output=True,
            text=True,
            timeout=300,
        )

        if apply_result.returncode != 0:
            return {
                "success": False,
                "message": "Terraform provisioning failed",
                "stdout": apply_result.stdout,
                "stderr": apply_result.stderr,
            }

        return {
            "success": True,
            "message": "Tenant provisioned successfully",
            "stdout": apply_result.stdout,
            "stderr": apply_result.stderr,
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "message": "Terraform execution timed out",
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e),
        }
def destroy_tenant(client_name: str):
    tenant_dir = TENANTS_DIR / client_name

    if not tenant_dir.exists():
        return {
            "success": False,
            "message": f"Terraform directory not found for tenant {client_name}",
        }

    try:
        destroy_result = subprocess.run(
            ["terraform", "destroy", "-auto-approve"],
            cwd=tenant_dir,
            capture_output=True,
            text=True,
            timeout=300,
        )

        if destroy_result.returncode != 0:
            return {
                "success": False,
                "message": "Terraform destroy failed",
                "stdout": destroy_result.stdout,
                "stderr": destroy_result.stderr,
            }

        shutil.rmtree(tenant_dir)

        return {
            "success": True,
            "message": "Tenant infrastructure destroyed successfully",
            "stdout": destroy_result.stdout,
            "stderr": destroy_result.stderr,
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "message": "Terraform destroy timed out",
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e),
        }
