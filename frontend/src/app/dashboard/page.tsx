"use client";
import React, { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import JobForm from "../components/JobForm";
import CompanyJobList from "../components/CompanyJobList";
import DashboardNavbar from "../components/dashboardCmp/DashboardNavbar";
import DashboardSidebar from "../components/dashboardCmp/DashboardSidebar";
import DashboardFooter from "../components/dashboardCmp/DashboardFooter";
import { useRouter } from "next/navigation";
import { clearAuth, getAuth } from "../../../lib/auth";

export default function DashboardPage() {
  const [editing, setEditing] = useState<any | null>(null);
  const router = useRouter();
  const { user } = getAuth();

  const handleLogout = () => {
    clearAuth();
    router.push("/");
  };

  return (
    <ProtectedRoute requiredRole="company">
      <div className="min-vh-100 d-flex flex-column bg-light">
        <DashboardNavbar userName={user?.name} onLogout={handleLogout} />

        <div className="container-fluid flex-grow-1 py-4">
          <div className="row g-3">
            <div className="col-12 col-md-3 col-lg-2">
              <DashboardSidebar
                activeHref="#overview"
                items={[
                  { href: "#overview", label: "Overview" },
                  { href: "#create-job", label: "Create Job" },
                  { href: "#your-jobs", label: "Your Jobs" },
                ]}
              />
            </div>

            <main className="col-12 col-md-9 col-lg-10">
              <section id="overview" className="mb-4">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-4 p-md-5">
                    <div className="row align-items-center g-4">
                      <div className="col-12 col-lg-6">
                        <h3 className="mb-2">Welcome back, {user?.name || "Company"}</h3>
                        <p className="text-muted mb-4">Manage postings, track applicants, and grow your team.</p>
                        <div className="d-flex gap-2 flex-wrap">
                          <a href="#create-job" className="btn btn-primary">Post a Job</a>
                          <a href="#your-jobs" className="btn btn-outline-secondary">View Your Jobs</a>
                        </div>
                      </div>
                      <div className="col-12 col-lg-6">
                        <img src="/globe.svg" alt="Dashboard illustration" className="img-fluid" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-4">
                <div className="row g-3">
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card text-center shadow-sm">
                      <div className="card-body">
                        <div className="text-muted">Active Jobs</div>
                        <div className="fs-3 fw-semibold">—</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card text-center shadow-sm">
                      <div className="card-body">
                        <div className="text-muted">Applicants</div>
                        <div className="fs-3 fw-semibold">—</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card text-center shadow-sm">
                      <div className="card-body">
                        <div className="text-muted">Interviews</div>
                        <div className="fs-3 fw-semibold">—</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card text-center shadow-sm">
                      <div className="card-body">
                        <div className="text-muted">Offers</div>
                        <div className="fs-3 fw-semibold">—</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="create-job" className="mb-4">
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Create or edit a job</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      <div className="col-12 col-lg-5">
                        <JobForm
                          editingJob={editing}
                          onSuccess={() => setEditing(null)}
                          onCancel={() => setEditing(null)}
                        />
                      </div>
                      <div className="col-12 col-lg-7" id="your-jobs">
                        <h5 className="mb-3">Your Jobs</h5>
                        <CompanyJobList onEdit={(job) => setEditing(job)} />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Applicants + Activity */}
              <section id="applicants" className="mb-4">
                <div className="row g-3">
                  <div className="col-12 col-xl-8">
                    <div className="card shadow-sm">
                      <div className="card-header bg-white d-flex flex-wrap gap-2 align-items-center justify-content-between">
                        <h5 className="mb-0">Applicants</h5>
                        <div className="d-flex gap-2">
                          <input className="form-control form-control-sm" placeholder="Search applicants" />
                          <select className="form-select form-select-sm" defaultValue="all">
                            <option value="all">All statuses</option>
                            <option value="review">In review</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                      <div className="table-responsive">
                        <table className="table align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Role</th>
                              <th>Status</th>
                              <th>Date</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Alex Johnson</td>
                              <td>Frontend Engineer</td>
                              <td><span className="badge bg-warning text-dark">In review</span></td>
                              <td>Sep 18, 2025</td>
                              <td className="text-end">
                                <button className="btn btn-sm btn-outline-primary me-1">View</button>
                                <button className="btn btn-sm btn-outline-secondary">Move</button>
                              </td>
                            </tr>
                            <tr>
                              <td>Priya Singh</td>
                              <td>Backend Engineer</td>
                              <td><span className="badge bg-info text-dark">Interview</span></td>
                              <td>Sep 17, 2025</td>
                              <td className="text-end">
                                <button className="btn btn-sm btn-outline-primary me-1">View</button>
                                <button className="btn btn-sm btn-outline-secondary">Move</button>
                              </td>
                            </tr>
                            <tr>
                              <td>Maria Garcia</td>
                              <td>Product Designer</td>
                              <td><span className="badge bg-success">Offer</span></td>
                              <td>Sep 15, 2025</td>
                              <td className="text-end">
                                <button className="btn btn-sm btn-outline-primary me-1">View</button>
                                <button className="btn btn-sm btn-outline-secondary">Move</button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-xl-4">
                    <div className="card shadow-sm h-100">
                      <div className="card-header bg-white">
                        <h5 className="mb-0">Recent Activity</h5>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush">
                          <div className="list-group-item px-0 d-flex justify-content-between">
                            <span>New application: Alex Johnson → Frontend</span>
                            <small className="text-muted">2h</small>
                          </div>
                          <div className="list-group-item px-0 d-flex justify-content-between">
                            <span>Interview scheduled: Priya Singh</span>
                            <small className="text-muted">1d</small>
                          </div>
                          <div className="list-group-item px-0 d-flex justify-content-between">
                            <span>Offer sent: Maria Garcia</span>
                            <small className="text-muted">3d</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>

        <DashboardFooter />
      </div>
    </ProtectedRoute>
  );
}
