import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Send, CheckCircle2, AlertCircle, FileText, MapPin, Image as ImageIcon } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import LocationPicker from '../components/LocationPicker';
import { reportService } from '../services/reportService';
import { isValidLatitude, isValidLongitude } from '../utils/validators';

export default function CreateReportPage() {
  const navigate = useNavigate();

  // Form State
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('25.435800');
  const [longitude, setLongitude] = useState('81.846300');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleLocationChange = (coords) => {
    if (coords.latitude !== undefined) setLatitude(coords.latitude);
    if (coords.longitude !== undefined) setLongitude(coords.longitude);
    if (coords.locationName !== undefined) setLocationName(coords.locationName);
  };

  const validateForm = () => {
    const errors = {};

    if (!imageFile) {
      errors.image = 'Please upload a photograph of the waste.';
    }

    if (!locationName.trim()) {
      errors.locationName = 'Please provide a location or street name.';
    }

    if (!latitude || !isValidLatitude(latitude)) {
      errors.latitude = 'Please provide a valid latitude (-90 to 90).';
    }

    if (!longitude || !isValidLongitude(longitude)) {
      errors.longitude = 'Please provide a valid longitude (-180 to 180).';
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      errors.description = 'Please enter a description of the waste.';
    } else if (trimmedDesc.length < 5) {
      errors.description = 'Description must be at least 5 characters long.';
    } else if (trimmedDesc.length > 1000) {
      errors.description = 'Description must not exceed 1000 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('description', description.trim());
      formData.append('location_name', locationName.trim());
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      const createdReport = await reportService.createReport(formData);

      // Redirect to the newly created report details page
      navigate(`/reports/${createdReport.id}`, {
        state: { message: 'Waste report submitted successfully!' },
      });
    } catch (err) {
      setErrorMessage(
        err.message || 'Report could not be submitted. Please check your image and try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '840px' }}>
      {/* Back button */}
      <Link
        to="/reports"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--slate-600)',
          fontWeight: 600,
          fontSize: '0.9rem',
          marginBottom: '1.25rem',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Reports Feed</span>
      </Link>

      <div className="form-card">
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlusCircle size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', color: 'var(--slate-900)' }}>Report Street Waste</h1>
          </div>
          <p style={{ color: 'var(--slate-600)', margin: 0, fontSize: '0.95rem' }}>
            Provide a photo and exact location so municipal staff or volunteers can take immediate cleanup action.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Submission Failed</strong>
              <span style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. Image Upload Section */}
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ImageIcon size={16} color="var(--primary-600)" />
                Photograph of Waste *
              </span>
              <span className="form-label-optional">Required (JPG/PNG/WEBP)</span>
            </label>
            <ImageUploader
              selectedFile={imageFile}
              onFileSelected={(file) => {
                setImageFile(file);
                if (formErrors.image) {
                  setFormErrors((prev) => ({ ...prev, image: null }));
                }
              }}
              onFileRemoved={() => setImageFile(null)}
            />
            {formErrors.image && <div className="form-error">{formErrors.image}</div>}
          </div>

          {/* 2. Location Section */}
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--primary-600)" />
                Location & Coordinates *
              </span>
              <span className="form-label-optional">Auto GPS or manual pin</span>
            </label>
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              locationName={locationName}
              onLocationChange={handleLocationChange}
            />
            {formErrors.locationName && <div className="form-error">{formErrors.locationName}</div>}
            {(formErrors.latitude || formErrors.longitude) && (
              <div className="form-error">{formErrors.latitude || formErrors.longitude}</div>
            )}
          </div>

          {/* 3. Description Section */}
          <div className="form-group" style={{ marginTop: '2rem' }}>
            <div className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} color="var(--primary-600)" />
                Waste Description *
              </span>
              <span style={{ fontSize: '0.8rem', color: description.length > 900 ? '#b91c1c' : 'var(--slate-400)' }}>
                {description.length}/1000 characters
              </span>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Large amount of plastic bottles and garbage dumped beside the road near the corner shop."
              className="form-textarea"
              maxLength={1000}
              required
            />
            {formErrors.description && <div className="form-error">{formErrors.description}</div>}
          </div>

          {/* 4. Submission Button */}
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Link to="/reports" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '180px' }}
            >
              {submitting ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
