from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    slug = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    database = Column(
        String(100),
        nullable=False
    )

    docker_image = Column(
        String(255),
        nullable=False,
        default="nginx:latest"
    )

    replicas = Column(
        Integer,
        nullable=False,
        default=1
    )

    status = Column(
        String(50),
        nullable=False,
        default="pending"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )