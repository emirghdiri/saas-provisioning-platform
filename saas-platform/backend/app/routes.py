from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import Tenant
from app.services.terraform_service import provision_tenant, destroy_tenant

router = APIRouter(prefix="/api")


# ============================================================
# SCHEMA
# ============================================================

class TenantCreate(BaseModel):

    name: str = Field(
        min_length=1,
        max_length=100
    )

    slug: str = Field(
        min_length=1,
        max_length=100
    )

    database: str = Field(
        min_length=1,
        max_length=100
    )

    dockerImage: str = Field(
        default="nginx:latest",
        min_length=1,
        max_length=255
    )

    replicas: int = Field(
        default=1,
        ge=1,
        le=20
    )


# ============================================================
# HEALTH
# ============================================================

@router.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# GET TENANTS
# ============================================================

@router.get("/tenants")
def get_tenants(
    db: Session = Depends(get_db)
):

    tenants = db.query(Tenant).all()

    return tenants


# ============================================================
# CREATE + PROVISION TENANT
# ============================================================

@router.post("/tenants")
def create_tenant(
    tenant_data: TenantCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Vérifier le slug
    # --------------------------------------------------------

    existing_tenant = (
        db.query(Tenant)
        .filter(
            Tenant.slug == tenant_data.slug
        )
        .first()
    )

    if existing_tenant:

        raise HTTPException(
            status_code=400,
            detail="A tenant with this slug already exists"
        )

    # --------------------------------------------------------
    # Créer le tenant dans PostgreSQL
    # --------------------------------------------------------

    tenant = Tenant(
        name=tenant_data.name,
        slug=tenant_data.slug,
        database=tenant_data.database,
        docker_image=tenant_data.dockerImage,
        replicas=tenant_data.replicas,
        status="pending"
    )

    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    # --------------------------------------------------------
    # Provisionner automatiquement Kubernetes
    # --------------------------------------------------------

    result = provision_tenant(
        client_name=tenant.slug,
        replicas=tenant.replicas,
        storage="2Gi",
        database=tenant.database,
        docker_image=tenant.docker_image
    )

    # --------------------------------------------------------
    # Terraform FAILURE
    # --------------------------------------------------------

    if not result["success"]:

        tenant.status = "error"

        db.commit()
        db.refresh(tenant)

        raise HTTPException(
            status_code=500,
            detail={
                "message": result["message"],
                "stdout": result.get("stdout", ""),
                "stderr": result.get("stderr", "")
            }
        )

    # --------------------------------------------------------
    # Terraform SUCCESS
    # --------------------------------------------------------

    tenant.status = "running"

    db.commit()
    db.refresh(tenant)

    return {
        "message": "Tenant created and provisioned successfully",
        "tenant": tenant,
        "terraform": {
            "stdout": result.get(
                "stdout",
                ""
            )
        }
    }


# ============================================================
# GET TENANT
# ============================================================

@router.get("/tenants/{tenant_id}")
def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db)
):

    tenant = (
        db.query(Tenant)
        .filter(
            Tenant.id == tenant_id
        )
        .first()
    )

    if not tenant:

        raise HTTPException(
            status_code=404,
            detail="Tenant not found"
        )

    return tenant


# ============================================================
# DELETE TENANT
# ============================================================

@router.delete("/tenants/{tenant_id}")
def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    tenant = (
        db.query(Tenant)
        .filter(Tenant.id == tenant_id)
        .first()
    )

    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    result = destroy_tenant(tenant.slug)

    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail={
                "message": result["message"],
                "stdout": result.get("stdout", ""),
                "stderr": result.get("stderr", "")
            }
        )

    db.delete(tenant)
    db.commit()

    return {
        "message": "Tenant and infrastructure deleted successfully"
    }

# ============================================================
# MANUAL PROVISION
# ============================================================

@router.post("/tenants/{tenant_id}/provision")
def provision_tenant_endpoint(
    tenant_id: int,
    db: Session = Depends(get_db)
):

    tenant = (
        db.query(Tenant)
        .filter(
            Tenant.id == tenant_id
        )
        .first()
    )

    if not tenant:

        raise HTTPException(
            status_code=404,
            detail="Tenant not found"
        )

    if tenant.status == "running":

        raise HTTPException(
            status_code=400,
            detail="Tenant is already provisioned"
        )

    result = provision_tenant(
        client_name=tenant.slug,
        replicas=tenant.replicas,
        storage="2Gi",
        database=tenant.database,
        docker_image=tenant.docker_image
    )

    if not result["success"]:

        tenant.status = "error"

        db.commit()

        raise HTTPException(
            status_code=500,
            detail={
                "message": result["message"],
                "stdout": result.get("stdout", ""),
                "stderr": result.get("stderr", "")
            }
        )

    tenant.status = "running"

    db.commit()
    db.refresh(tenant)

    return {
        "message": "Tenant provisioned successfully",
        "tenant": tenant,
        "terraform": {
            "stdout": result.get(
                "stdout",
                ""
            )
        }
    }