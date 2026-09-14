import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000/api";

function App() {
  const [activePage, setActivePage] = useState("overview");

  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    database: "",
    dockerImage: "nginx:latest",
    replicas: 1,
  });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/tenants`);

      if (!response.ok) {
        throw new Error("Impossible de récupérer les tenants");
      }

      const data = await response.json();

      setTenants(data);

      if (selectedTenant) {
        const updatedSelectedTenant = data.find(
          (tenant) => tenant.id === selectedTenant.id
        );

        setSelectedTenant(updatedSelectedTenant || null);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de contacter le backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Le nom du client est obligatoire.");
      return;
    }

    if (!form.slug.trim()) {
      alert("Le slug est obligatoire.");
      return;
    }

    if (!form.database.trim()) {
      alert("Le nom de la base de données est obligatoire.");
      return;
    }

    if (!form.dockerImage.trim()) {
      alert("L'image Docker est obligatoire.");
      return;
    }

    if (Number(form.replicas) < 1) {
      alert("Le nombre de replicas doit être supérieur ou égal à 1.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const createResponse = await fetch(`${API_URL}/tenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          database: form.database.trim(),
          dockerImage: form.dockerImage.trim(),
          replicas: Number(form.replicas),
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        let message = "Erreur lors de la création du tenant.";

        if (typeof createData.detail === "string") {
          message = createData.detail;
        } else if (createData.detail?.message) {
          message = createData.detail.message;
        }

        throw new Error(message);
      }

      const createdTenant = createData.tenant || createData;

      const tenantForFrontend = {
        ...createdTenant,
        status: createdTenant.status || "running",
        docker_image:
          createdTenant.docker_image ||
          createdTenant.dockerImage ||
          form.dockerImage.trim(),
        replicas:
          createdTenant.replicas ||
          Number(form.replicas),
      };

      setTenants((previousTenants) => [
        ...previousTenants.filter(
          (tenant) => tenant.id !== tenantForFrontend.id
        ),
        tenantForFrontend,
      ]);

      setSelectedTenant(tenantForFrontend);

      setForm({
        name: "",
        slug: "",
        database: "",
        dockerImage: "nginx:latest",
        replicas: 1,
      });

      setShowCreateModal(false);
      setActivePage("tenants");

      alert(
        `Tenant "${tenantForFrontend.name}" créé et provisionné avec succès.`
      );

      await fetchTenants();
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    const tenant = tenants.find(
      (item) => item.id === tenantId
    );

    if (!tenant) return;

    const confirmed = window.confirm(
      `Supprimer le tenant "${tenant.name}" ?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/tenants/${tenantId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Erreur lors de la suppression"
        );
      }

      setTenants((previousTenants) =>
        previousTenants.filter(
          (item) => item.id !== tenantId
        )
      );

      if (selectedTenant?.id === tenantId) {
        setSelectedTenant(null);
      }

      alert(
        `Tenant "${tenant.name}" supprimé avec succès.`
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(err.message);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "replicas"
          ? Number(value)
          : value,
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (e) => {
    const name = e.target.value;

    setForm((previous) => ({
      ...previous,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleRefresh = () => {
    fetchTenants();
  };

  const handleNavigation = (page) => {
    setActivePage(page);

    if (page !== "tenants") {
      setSelectedTenant(null);
    }
  };

  const runningTenants = tenants.filter(
    (tenant) => tenant.status === "running"
  ).length;

  const pendingTenants = tenants.filter(
    (tenant) => tenant.status === "pending"
  ).length;

  const errorTenants = tenants.filter(
    (tenant) => tenant.status === "error"
  ).length;

  const renderSidebar = () => (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">
          S
        </div>

        <div>
          <h2>SaaS Platform</h2>
          <span>Provisioning</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${
            activePage === "overview"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("overview")
          }
        >
          <span>▦</span>
          Dashboard
        </button>

        <button
          className={`nav-item ${
            activePage === "tenants"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("tenants")
          }
        >
          <span>◉</span>
          Tenants
        </button>

        <button
          className={`nav-item ${
            activePage === "infrastructure"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("infrastructure")
          }
        >
          <span>◈</span>
          Infrastructure
        </button>

        <button
          className={`nav-item ${
            activePage === "applications"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("applications")
          }
        >
          <span>▣</span>
          Applications
        </button>

        <button
          className={`nav-item ${
            activePage === "monitoring"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("monitoring")
          }
        >
          <span>◌</span>
          Monitoring
        </button>

        <button
          className={`nav-item ${
            activePage === "settings"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("settings")
          }
        >
          <span>⚙</span>
          Settings
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="system-status">
          <span className="status-dot"></span>

          <div>
            <strong>Platform online</strong>
            <small>Kubernetes cluster</small>
          </div>
        </div>
      </div>
    </aside>
  );

  const renderTopbar = (title, description) => (
    <header className="topbar">
      <div>
        <h1>{title}</h1>

        <p>
          {description}
        </p>
      </div>

      <div className="topbar-actions">
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          ↻
        </button>

        <button
          className="create-btn"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          + Create Tenant
        </button>
      </div>
    </header>
  );

  const renderOverview = () => (
    <>
      {renderTopbar(
        "Dashboard",
        "Manage and monitor your SaaS tenants"
      )}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Tenants</span>
          <strong>{tenants.length}</strong>
        </div>

        <div className="stat-card">
          <span>Running</span>
          <strong>{runningTenants}</strong>
        </div>

        <div className="stat-card">
          <span>Pending</span>
          <strong>{pendingTenants}</strong>
        </div>

        <div className="stat-card">
          <span>Errors</span>
          <strong>{errorTenants}</strong>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Tenants</h2>

            <p>
              Your provisioned SaaS environments
            </p>
          </div>

          <span className="tenant-count">
            {tenants.length} tenant
            {tenants.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {renderTenantTable()}
      </section>
    </>
  );

  const renderTenants = () => (
    <>
      {renderTopbar(
        "Tenants",
        "Manage and provision your client environments"
      )}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>Client Tenants</h2>

            <p>
              All provisioned client environments
            </p>
          </div>

          <button
            className="create-btn"
            onClick={() =>
              setShowCreateModal(true)
            }
          >
            + Create Tenant
          </button>
        </div>

        {renderTenantTable()}
      </section>

      {selectedTenant &&
        renderTenantDetails()}
    </>
  );

  const renderTenantTable = () => {
    if (loading) {
      return (
        <div className="empty-state">
          <div className="loader"></div>

          <p>
            Loading tenants...
          </p>
        </div>
      );
    }

    if (tenants.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            ◫
          </div>

          <h3>
            No tenants yet
          </h3>

          <p>
            Create your first tenant to get started.
          </p>

          <button
            className="create-btn"
            onClick={() =>
              setShowCreateModal(true)
            }
          >
            + Create Tenant
          </button>
        </div>
      );
    }

    return (
      <div className="tenant-table-wrapper">
        <table className="tenant-table">
          <thead>
            <tr>
              <th>
                Tenant
              </th>

              <th>
                Database
              </th>

              <th>
                Status
              </th>

              <th>
                Created
              </th>

              <th>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {tenants.map((tenant) => (
              <tr
                key={tenant.id}
                className={
                  selectedTenant?.id === tenant.id
                    ? "selected-row"
                    : ""
                }
                onClick={() =>
                  setSelectedTenant(tenant)
                }
              >
                <td>
                  <div className="tenant-info">
                    <div className="tenant-avatar">
                      {tenant.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {tenant.name}
                      </strong>

                      <small>
                        {tenant.slug}
                      </small>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="database-badge">
                    {tenant.database}
                  </span>
                </td>

                <td>
                  <span
                    className={`status-badge ${
                      tenant.status === "running"
                        ? "running"
                        : tenant.status === "error"
                        ? "error"
                        : "pending"
                    }`}
                  >
                    <span className="status-dot"></span>

                    {tenant.status}
                  </span>
                </td>

                <td>
                  {tenant.created_at
                    ? new Date(
                        tenant.created_at
                      ).toLocaleDateString()
                    : "-"}
                </td>

                <td>
                  <div
                    className="action-buttons"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <button
                      className="view-btn"
                      onClick={() =>
                        setSelectedTenant(
                          tenant
                        )
                      }
                    >
                      View
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDeleteTenant(
                          tenant.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTenantDetails = () => {
    if (!selectedTenant) {
      return null;
    }

    return (
      <section className="tenant-details">
        <div className="section-header">
          <div>
            <h2>
              {selectedTenant.name}
            </h2>

            <p>
              Tenant details
            </p>
          </div>

          <button
            className="close-details"
            onClick={() =>
              setSelectedTenant(null)
            }
          >
            ×
          </button>
        </div>

        <div className="details-grid">
          <div>
            <span>ID</span>

            <strong>
              #{selectedTenant.id}
            </strong>
          </div>

          <div>
            <span>Slug</span>

            <strong>
              {selectedTenant.slug}
            </strong>
          </div>

          <div>
            <span>Database</span>

            <strong>
              {selectedTenant.database}
            </strong>
          </div>

          <div>
            <span>Docker Image</span>

            <strong>
              {selectedTenant.docker_image ||
                selectedTenant.dockerImage ||
                "Not available"}
            </strong>
          </div>

          <div>
            <span>Replicas</span>

            <strong>
              {selectedTenant.replicas || 1}
            </strong>
          </div>

          <div>
            <span>Namespace</span>

            <strong>
              tenant-{selectedTenant.slug}
            </strong>
          </div>

          <div>
            <span>Status</span>

            <strong>
              {selectedTenant.status}
            </strong>
          </div>

          <div>
            <span>Created</span>

            <strong>
              {selectedTenant.created_at
                ? new Date(
                    selectedTenant.created_at
                  ).toLocaleString()
                : "-"}
            </strong>
          </div>
        </div>
      </section>
    );
  };

  const renderInfrastructure = () => (
    <>
      {renderTopbar(
        "Infrastructure",
        "Manage your Kubernetes infrastructure"
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <span>
            Cluster
          </span>

          <strong>
            Ready
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Nodes
          </span>

          <strong>
            1
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Tenants
          </span>

          <strong>
            {tenants.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Ingress
          </span>

          <strong>
            Traefik
          </strong>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>
              Kubernetes Cluster
            </h2>

            <p>
              Infrastructure overview
            </p>
          </div>

          <span className="status-badge running">
            <span className="status-dot"></span>
            Online
          </span>
        </div>

        <div className="details-grid">
          <div>
            <span>
              Cluster
            </span>

            <strong>
              k3s
            </strong>
          </div>

          <div>
            <span>
              Orchestration
            </span>

            <strong>
              Kubernetes
            </strong>
          </div>

          <div>
            <span>
              Tenants
            </span>

            <strong>
              {tenants.length}
            </strong>
          </div>

          <div>
            <span>
              Ingress
            </span>

            <strong>
              Traefik
            </strong>
          </div>
        </div>
      </section>
    </>
  );

  const renderApplications = () => (
    <>
      {renderTopbar(
        "Applications",
        "Manage applications deployed for your tenants"
      )}

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>
              Applications
            </h2>

            <p>
              Applications provisioned across your tenants
            </p>
          </div>
        </div>

        {tenants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ▣
            </div>

            <h3>
              No applications
            </h3>

            <p>
              Create a tenant to provision an application.
            </p>
          </div>
        ) : (
          <div className="tenant-table-wrapper">
            <table className="tenant-table">
              <thead>
                <tr>
                  <th>
                    Application
                  </th>

                  <th>
                    Tenant
                  </th>

                  <th>
                    Docker Image
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Replicas
                  </th>
                </tr>
              </thead>

              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <strong>
                        {tenant.name} App
                      </strong>
                    </td>

                    <td>
                      {tenant.name}
                    </td>

                    <td>
                      <span className="database-badge">
                        {tenant.docker_image ||
                          tenant.dockerImage ||
                          "Not available"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          tenant.status === "running"
                            ? "running"
                            : tenant.status === "error"
                            ? "error"
                            : "pending"
                        }`}
                      >
                        <span className="status-dot"></span>

                        {tenant.status}
                      </span>
                    </td>

                    <td>
                      {tenant.replicas || 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );

  const renderMonitoring = () => (
    <>
      {renderTopbar(
        "Monitoring",
        "Monitor your SaaS platform and Kubernetes resources"
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <span>
            Platform
          </span>

          <strong>
            Online
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Tenants
          </span>

          <strong>
            {tenants.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Running
          </span>

          <strong>
            {runningTenants}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            Pending
          </span>

          <strong>
            {pendingTenants}
          </strong>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>
              System Monitoring
            </h2>

            <p>
              Platform health overview
            </p>
          </div>

          <span className="status-badge running">
            <span className="status-dot"></span>
            Healthy
          </span>
        </div>

        <div className="details-grid">
          <div>
            <span>
              API
            </span>

            <strong>
              Online
            </strong>
          </div>

          <div>
            <span>
              Database
            </span>

            <strong>
              PostgreSQL
            </strong>
          </div>

          <div>
            <span>
              Kubernetes
            </span>

            <strong>
              Ready
            </strong>
          </div>

          <div>
            <span>
              Backend
            </span>

            <strong>
              FastAPI
            </strong>
          </div>
        </div>
      </section>
    </>
  );

  const renderSettings = () => (
    <>
      {renderTopbar(
        "Settings",
        "Configure your SaaS provisioning platform"
      )}

      <section className="content-section">
        <div className="section-header">
          <div>
            <h2>
              Platform Settings
            </h2>

            <p>
              General platform configuration
            </p>
          </div>
        </div>

        <div className="details-grid">
          <div>
            <span>
              Platform
            </span>

            <strong>
              SaaS Platform
            </strong>
          </div>

          <div>
            <span>
              Environment
            </span>

            <strong>
              Local
            </strong>
          </div>

          <div>
            <span>
              Backend
            </span>

            <strong>
              FastAPI
            </strong>
          </div>

          <div>
            <span>
              Database
            </span>

            <strong>
              PostgreSQL
            </strong>
          </div>

          <div>
            <span>
              Container Runtime
            </span>

            <strong>
              Docker
            </strong>
          </div>

          <div>
            <span>
              Orchestration
            </span>

            <strong>
              Kubernetes / k3s
            </strong>
          </div>

          <div>
            <span>
              Infrastructure as Code
            </span>

            <strong>
              Terraform
            </strong>
          </div>
        </div>
      </section>
    </>
  );

  const renderCreateModal = () => {
    if (!showCreateModal) {
      return null;
    }

    return (
      <div
        className="modal-overlay"
        onClick={() =>
          !creating &&
          setShowCreateModal(false)
        }
      >
        <div
          className="modal"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <div className="modal-header">
            <div>
              <h2>
                Create Tenant
              </h2>

              <p>
                Create a new SaaS environment
              </p>
            </div>

            <button
              className="modal-close"
              onClick={() =>
                !creating &&
                setShowCreateModal(false)
              }
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleCreateTenant}
            className="tenant-form"
          >
            <div className="form-group">
              <label>
                Client name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleNameChange}
                placeholder="e.g. Acme Corporation"
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>
                Slug
              </label>

              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleFormChange}
                placeholder="acme-corporation"
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>
                Database
              </label>

              <input
                type="text"
                name="database"
                value={form.database}
                onChange={handleFormChange}
                placeholder="e.g. acme_db"
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>
                Docker image
              </label>

              <input
                type="text"
                name="dockerImage"
                value={form.dockerImage}
                onChange={handleFormChange}
                placeholder="e.g. nginx:latest"
                disabled={creating}
              />
            </div>

            <div className="form-group">
              <label>
                Replicas
              </label>

              <input
                type="number"
                name="replicas"
                min="1"
                max="20"
                value={form.replicas}
                onChange={handleFormChange}
                disabled={creating}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() =>
                  !creating &&
                  setShowCreateModal(false)
                }
                disabled={creating}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-btn"
                disabled={creating}
              >
                {creating
                  ? "Creating and provisioning..."
                  : "Create Tenant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderPage = () => {
    switch (activePage) {
      case "tenants":
        return renderTenants();

      case "infrastructure":
        return renderInfrastructure();

      case "applications":
        return renderApplications();

      case "monitoring":
        return renderMonitoring();

      case "settings":
        return renderSettings();

      case "overview":
      default:
        return renderOverview();
    }
  };

  return (
    <div className="app">
      {renderSidebar()}

      <main className="main-content">
        {renderPage()}
      </main>

      {renderCreateModal()}
    </div>
  );
}

export default App;