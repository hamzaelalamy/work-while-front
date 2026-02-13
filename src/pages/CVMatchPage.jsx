import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Briefcase, MapPin, Building2, Loader2 } from 'lucide-react';
import cvService from '../services/cvService';
import { handleApiError } from '../config/apiConfig';

const ACCEPT = '.pdf,.doc,.docx';
const MAX_SIZE_MB = 5;

function formatPostedDate(createdAt) {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function CVMatchPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [semanticCount, setSemanticCount] = useState(null); // number of personalized matches; null = unknown
  const [fallback, setFallback] = useState(false); // true when some/all results are "recent" not semantic

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB`);
      return;
    }
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(selected.type)) {
      setError('Please upload a PDF or DOCX file.');
      return;
    }
    setError(null);
    setFile(selected);
    setMatches([]);
    setSearchDone(false);
    setSemanticCount(null);
    setFallback(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) {
      const ev = { target: { files: [f] } };
      handleFileChange(ev);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CV file first.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { matches: list, semanticCount: sc, fallback: fb } = await cvService.uploadAndGetMatches(file, 20);
      setMatches(Array.isArray(list) ? list : []);
      setSemanticCount(typeof sc === 'number' ? sc : null);
      setFallback(Boolean(fb));
      setSearchDone(true);
    } catch (err) {
      const info = handleApiError(err);
      const message = info?.message || err?.message || 'Upload failed. Please try again.';
      setError(message);
      setMatches([]);
    } finally {
      setUploading(false);
    }
  };

  const loadSavedMatches = async () => {
    setLoadingMatches(true);
    setError(null);
    try {
      const { matches: list, semanticCount: sc, fallback: fb } = await cvService.getMatches(20);
      setMatches(Array.isArray(list) ? list : []);
      setSemanticCount(typeof sc === 'number' ? sc : null);
      setFallback(Boolean(fb));
      setSearchDone(true);
    } catch (err) {
      const info = handleApiError(err);
      setError(info.message || 'Failed to load matches');
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          CV Job Matching
        </h1>
        <p className="text-gray-600 mb-8">
          Upload your CV (PDF or DOCX) to find jobs that match your experience using semantic matching.
        </p>

        {/* Upload zone */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop your CV here, or</p>
            <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
              Choose file
              <input
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {file && (
              <p className="mt-4 text-sm text-gray-700 font-medium">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">PDF or DOCX, max {MAX_SIZE_MB}MB</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4" />
                  Find matching jobs
                </>
              )}
            </button>
            <button
              type="button"
              onClick={loadSavedMatches}
              disabled={loadingMatches}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              {loadingMatches ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Use last uploaded CV
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {matches.length > 0 && (
          <div>
            {fallback && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                {semanticCount === 0 ? (
                  <>No personalized matches for your CV. Showing recent job listings instead. Results will not change with different CVs until job vectorization is run on the server (e.g. <code className="bg-amber-100 px-1 rounded">npm run vectorize-jobs</code>).</>
                ) : (
                  <>Showing {semanticCount} personalized match{semanticCount !== 1 ? 'es' : ''} and some recent listings.</>
                )}
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Matched jobs ({matches.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((job) => (
                <div
                  key={job._id || job.id}
                  onClick={() => navigate(`/jobs/${job._id || job.id}`)}
                  className="bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span
                      className="shrink-0 px-2 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800"
                      title="Similarity score"
                    >
                      {job.similarityScore != null ? `${job.similarityScore}% match` : '—'}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-600 flex items-center gap-1">
                    <Building2 className="w-4 h-4 shrink-0" />
                    {job.company?.name || job.companyName || 'Unknown Company'}
                  </p>
                  {job.location && (
                    <p className="mt-1 text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {job.location}
                    </p>
                  )}
                  {Array.isArray(job.matchingSkills) && job.matchingSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Matching skills:</span>
                      {job.matchingSkills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.matchingSkills.length > 6 && (
                        <span className="text-xs text-gray-500">+{job.matchingSkills.length - 6}</span>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Posted: {formatPostedDate(job.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-blue-600 font-medium">View details →</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {matches.length === 0 && !uploading && !loadingMatches && file && !error && !searchDone && (
          <p className="text-gray-500 text-center py-8">Click &quot;Find matching jobs&quot; to see results.</p>
        )}
        {matches.length === 0 && !uploading && !loadingMatches && file && !error && searchDone && (
          <p className="text-gray-500 text-center py-8">
            No matching jobs found. Try adding more jobs to the platform or use a different CV.
          </p>
        )}
        {matches.length === 0 && !file && !uploading && !loadingMatches && (
          <p className="text-gray-500 text-center py-8">Upload a CV to get started.</p>
        )}
      </div>
    </div>
  );
}
