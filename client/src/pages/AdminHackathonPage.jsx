import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import HackathonForm from '../components/HackathonForm.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { extractApiError } from '../services/authService.js';
import {
  createHackathon,
  deleteHackathon,
  fetchHackathons,
  updateHackathon,
} from '../services/hackathonService.js';
import { formatDateRange, formatShortDate } from '../utils/formatters.js';

function AdminHackathonPage() {
  const [hackathons, setHackathons] = useState([]);
  const [counts, setCounts] = useState({ total: 0, upcoming: 0, ongoing: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [formMode, setFormMode] = useState(null); // null | 'create' | 'edit'
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAllHackathons = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetchHackathons({ limit: 50, sort: 'newest' });
      const payload = response?.data || {};
      setHackathons(payload.hackathons || []);
      if (payload.meta?.counts) {
        setCounts(payload.meta.counts);
      }
    } catch (err) {
      const parsed = extractApiError(err, 'Failed to load hackathons.');
      setError(parsed.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllHackathons();
  }, [loadAllHackathons]);

  function openCreateForm() {
    setFeedback(null);
    setEditingHackathon(null);
    setFormMode('create');
  }

  function openEditForm(hackathon) {
    setFeedback(null);
    setEditingHackathon(hackathon);
    setFormMode('edit');
  }

  function closeForm() {
    setFormMode(null);
    setEditingHackathon(null);
  }

  async function handleFormSubmit(payload) {
    if (formMode === 'edit' && editingHackathon) {
      const res = await updateHackathon(editingHackathon.id, payload);
      setFeedback({
        type: 'success',
        message: res?.message || 'Hackathon updated successfully.',
      });
    } else {
      const res = await createHackathon(payload);
      setFeedback({
        type: 'success',
        message: res?.message || 'Hackathon created successfully.',
      });
    }

    closeForm();
    await loadAllHackathons();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setIsDeleting(true);
    setFeedback(null);
    try {
      const res = await deleteHackathon(pendingDelete.id);
      setFeedback({
        type: 'success',
        message: res?.message || `"${pendingDelete.title}" was deleted.`,
      });
      setPendingDelete(null);
      await loadAllHackathons();
    } catch (err) {
      const parsed = extractApiError(err, 'Unable to delete hackathon.');
      setFeedback({ type: 'error', message: parsed.message });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="page-wrapper">
      <section className="page-hero page-hero--compact">
        <div className="container page-hero__inner">
          <div className="page-hero__text">
            <span className="hero-eyebrow">Admin Management Console</span>
            <h1 className="page-hero__title">Manage Hackathons</h1>
            <p className="page-hero__subtitle">
              Create, update, and moderate hackathons listed across HackSpot. All changes reflect
              immediately in student discovery.
            </p>
          </div>

          <div className="page-hero__actions">
            {formMode ? (
              <button type="button" className="btn btn--hero-secondary" onClick={closeForm}>
                &larr; Back to List
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={openCreateForm}>
                + New Hackathon
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-card__label">Total Hackathons</span>
            <strong className="stat-card__value">{counts.total}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Upcoming</span>
            <strong className="stat-card__value">{counts.upcoming}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Live Now</span>
            <strong className="stat-card__value">{counts.ongoing}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Completed</span>
            <strong className="stat-card__value">{counts.completed}</strong>
          </div>
        </div>

        {feedback && (
          <div className={`alert alert--${feedback.type}`} role="status">
            {feedback.message}
          </div>
        )}

        {error && (
          <div className="alert alert--error" role="alert">
            <span>{error}</span>
            <button type="button" className="inline-retry-btn" onClick={loadAllHackathons}>
              Retry
            </button>
          </div>
        )}

        {formMode ? (
          <div className="surface-card admin-form-shell">
            <HackathonForm
              key={editingHackathon?.id || 'new'}
              initialData={editingHackathon}
              onSubmit={handleFormSubmit}
              onCancel={closeForm}
            />
          </div>
        ) : isLoading ? (
          <LoadingSkeleton count={3} variant="cards" />
        ) : hackathons.length === 0 ? (
          <EmptyState
            title="No hackathons published yet"
            description="Create your first hackathon listing or run the demo seed script for sample events."
            actionLabel="Create Hackathon"
            onAction={openCreateForm}
          />
        ) : (
          <div className="surface-card admin-table-card">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hackathon</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Dates</th>
                    <th>Deadline</th>
                    <th className="admin-table__actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hackathons.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-table__title-cell">
                          <Link to={`/hackathons/${item.slug}`} className="admin-table__title">
                            {item.title}
                          </Link>
                          {item.isDemo && <StatusBadge isDemo />}
                        </div>
                        <span className="admin-table__org">{item.organizerName}</span>
                      </td>
                      <td>
                        <StatusBadge mode={item.mode} />
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="admin-table__nowrap">
                        {formatDateRange(item.startDate, item.endDate)}
                      </td>
                      <td className="admin-table__nowrap">
                        {formatShortDate(item.registrationDeadline)}
                      </td>
                      <td className="admin-table__actions">
                        <Link
                          to={`/hackathons/${item.slug}`}
                          className="btn btn--ghost btn--xs"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          className="btn btn--secondary btn--xs"
                          onClick={() => openEditForm(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--xs"
                          onClick={() => setPendingDelete(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {pendingDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="modal-card">
            <h2 id="delete-modal-title" className="modal-card__title">
              Delete Hackathon?
            </h2>
            <p className="modal-card__text">
              Are you sure you want to permanently delete{' '}
              <strong>{pendingDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="modal-card__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setPendingDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Hackathon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHackathonPage;
