import { useCallback, useEffect, useState } from 'react';
import ProfileEditForm from '../components/ProfileEditForm.jsx';
import UserAvatar from '../components/UserAvatar.jsx';
import useAuth from '../hooks/useAuth.js';
import { extractApiError } from '../services/authService.js';
import { fetchMyProfile, updateMyProfile } from '../services/userService.js';
import { formatShortDate } from '../utils/formatters.js';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);

  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    setLoadError('');

    try {
      const response = await fetchMyProfile();
      const fetchedUser = response?.data?.user || null;
      if (fetchedUser) {
        setProfile(fetchedUser);
        updateUser(fetchedUser);
      }
    } catch (error) {
      const parsed = extractApiError(error, 'Unable to load your profile.');
      setLoadError(parsed.message);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [updateUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleSaveProfile(payload) {
    const response = await updateMyProfile(payload);
    const updatedUser = response?.data?.user;

    if (updatedUser) {
      setProfile(updatedUser);
      updateUser(updatedUser);
    }

    setIsEditing(false);
    setStatusBanner({
      type: 'success',
      message: response?.message || 'Profile updated successfully.',
    });
  }

  function handleStartEditing() {
    setStatusBanner(null);
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setIsEditing(false);
  }

  if (isLoadingProfile && !profile) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <p>Loading your student profile...</p>
      </div>
    );
  }

  const activeProfile = profile || user;

  return (
    <div className="page-wrapper">
      <section className="page-hero page-hero--compact">
        <div className="container page-hero__inner">
          <div className="page-hero__text">
            <span className="hero-eyebrow">Student Identity</span>
            <h1 className="page-hero__title">Your HackSpot Profile</h1>
            <p className="page-hero__subtitle">
              Keep your skills, hackathon interests, and college details current so future teammates
              know what you build best.
            </p>
          </div>
          {!isEditing && (
            <button type="button" className="btn btn--primary" onClick={handleStartEditing}>
              Edit Profile
            </button>
          )}
        </div>
      </section>

      <section className="container section-block profile-container">
        <div className="surface-card profile-card">
          {loadError && (
            <div className="alert alert--error" role="alert">
              <span>{loadError}</span>
              <button type="button" className="inline-retry-btn" onClick={loadProfile}>
                Retry
              </button>
            </div>
          )}

          {statusBanner && (
            <div className={`alert alert--${statusBanner.type}`} role="status">
              {statusBanner.message}
            </div>
          )}

          {isEditing ? (
            <ProfileEditForm
              profile={activeProfile}
              onSave={handleSaveProfile}
              onCancel={handleCancelEditing}
            />
          ) : (
            <>
              <div className="profile-header">
                <div className="profile-header__identity">
                  <UserAvatar
                    name={activeProfile.name}
                    src={activeProfile.profileImage}
                    size="lg"
                  />
                  <div className="profile-header__meta">
                    <div className="profile-header__name-row">
                      <h2 className="profile-header__name">{activeProfile.name}</h2>
                      <span className="role-pill">{activeProfile.role}</span>
                    </div>
                    <p className="profile-header__college">{activeProfile.college}</p>
                    <p className="profile-header__dates">
                      Joined {formatShortDate(activeProfile.createdAt)} &middot; Last updated{' '}
                      {formatShortDate(activeProfile.updatedAt)}
                    </p>
                  </div>
                </div>

                <button type="button" className="btn btn--secondary" onClick={handleStartEditing}>
                  Edit Profile
                </button>
              </div>

              <div className="profile-grid">
                <div className="profile-item">
                  <span className="profile-item__label">
                    Email Address <span className="readonly-badge">Read-only</span>
                  </span>
                  <strong className="profile-item__value">{activeProfile.email}</strong>
                </div>

                <div className="profile-item">
                  <span className="profile-item__label">College / University</span>
                  <strong className="profile-item__value">{activeProfile.college}</strong>
                </div>
              </div>

              <div className="profile-sections">
                <div className="profile-section">
                  <h3 className="profile-section__title">Skills</h3>
                  {activeProfile.skills && activeProfile.skills.length > 0 ? (
                    <div className="tag-list">
                      {activeProfile.skills.map((skill) => (
                        <span key={skill} className="tag-chip">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-text">
                      No skills listed yet. Click Edit Profile to showcase your technical stack.
                    </p>
                  )}
                </div>

                <div className="profile-section">
                  <h3 className="profile-section__title">Interests</h3>
                  {activeProfile.interests && activeProfile.interests.length > 0 ? (
                    <div className="tag-list">
                      {activeProfile.interests.map((interest) => (
                        <span key={interest} className="tag-chip tag-chip--interest">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="muted-text">
                      No interests listed yet. Add hackathon tracks or domains you enjoy building
                      in.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
