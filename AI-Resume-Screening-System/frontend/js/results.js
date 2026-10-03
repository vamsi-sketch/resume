/**
 * Candidate Results & Ranking Client Logic
 */
let allResults = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadFilterOptions();
  await fetchResults();
  setupFilterListeners();
});

async function loadFilterOptions() {
  const jobSelect = document.getElementById('filter-job');
  if (!jobSelect) return;

  try {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    if (data.jobs) {
      jobSelect.innerHTML = `<option value="">All Jobs</option>` + data.jobs.map(j => `
        <option value="${j.job_id}">${j.title}</option>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load jobs for filter:', err);
  }
}

async function fetchResults() {
  const job = document.getElementById('filter-job')?.value || '';
  const search = document.getElementById('filter-search')?.value || '';
  const skill = document.getElementById('filter-skill')?.value || '';
  const minScore = document.getElementById('filter-score')?.value || '';
  const status = document.getElementById('filter-status')?.value || 'all';
  const sort = document.getElementById('filter-sort')?.value || 'score';

  const params = new URLSearchParams();
  if (job) params.append('job_id', job);
  if (search) params.append('search', search);
  if (skill) params.append('skill', skill);
  if (minScore) params.append('min_score', minScore);
  if (status) params.append('status', status);
  if (sort) params.append('sort', sort);

  try {
    const res = await fetch(`/api/results?${params.toString()}`);
    const data = await res.json();
    if (data.success) {
      allResults = data.results || [];
      renderResults(allResults);
    }
  } catch (err) {
    console.error('Failed to fetch candidate results:', err);
  }
}

function renderResults(results) {
  const tbody = document.getElementById('results-table-body');
  const countEl = document.getElementById('results-count');
  if (!tbody) return;

  if (countEl) countEl.innerText = `${results.length} Candidates Screened`;

  if (results.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 48px; color: #94a3b8;">
          No candidates match your current filter criteria. Try adjusting the search or filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = results.map(r => {
    const scoreColorClass = r.match_score >= 80 ? 'high' : r.match_score >= 60 ? 'mid' : 'low';
    const progressClass = r.match_score >= 80 ? 'progress-high' : r.match_score >= 60 ? 'progress-mid' : 'progress-low';

    return `
      <tr>
        <td style="min-width: 200px;">
          <span class="candidate-row-name">${r.candidate_name}</span>
          <span class="candidate-row-email">${r.candidate_email}</span>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Applied for: <strong>${r.job_title}</strong></div>
        </td>
        <td style="min-width: 140px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="score-badge ${scoreColorClass}">${r.match_score}%</span>
            <span style="font-size: 11px; color: #64748b;">Match</span>
          </div>
          <div class="progress-bar-container" style="width: 100px;">
            <div class="progress-bar-fill ${progressClass}" style="width: ${r.match_score}%;"></div>
          </div>
        </td>
        <td style="min-width: 180px;">
          <div class="skills-pill-group">
            ${(r.matching_skills || []).slice(0, 4).map(s => `
              <span class="skill-tag-match">✓ ${s}</span>
            `).join('')}
            ${(r.matching_skills || []).length > 4 ? `<span style="font-size: 11px; color: #64748b;">+${r.matching_skills.length - 4}</span>` : ''}
          </div>
        </td>
        <td style="min-width: 140px;">
          <div class="skills-pill-group">
            ${(r.missing_skills || []).slice(0, 3).map(s => `
              <span class="skill-tag-missing">✗ ${s}</span>
            `).join('')}
            ${(r.missing_skills || []).length === 0 ? '<span style="font-size: 11px; color: #059669;">All skills met</span>' : ''}
          </div>
        </td>
        <td>
          <strong>${r.candidate_experience} yrs</strong>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <select onchange="updateCandidateStatus('${r.candidate_id}', this.value)" class="select-filter" style="padding: 4px 8px; font-size: 12px;">
              <option value="Review" ${r.status === 'Review' ? 'selected' : ''}>Review</option>
              <option value="Shortlisted by Recruiter" ${r.status === 'Shortlisted by Recruiter' ? 'selected' : ''}>Shortlisted by Recruiter</option>
              <option value="Under Review" ${r.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
              <option value="Hold" ${r.status === 'Hold' ? 'selected' : ''}>Hold</option>
            </select>
            <a href="candidate.html?id=${r.candidate_id}" class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px; text-align: center;">View Details</a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupFilterListeners() {
  const inputs = ['filter-job', 'filter-search', 'filter-skill', 'filter-score', 'filter-status', 'filter-sort'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', fetchResults);
      if (el.tagName === 'INPUT') {
        el.addEventListener('keyup', () => {
          clearTimeout(window._searchTimer);
          window._searchTimer = setTimeout(fetchResults, 300);
        });
      }
    }
  });
}

async function updateCandidateStatus(candidateId, status) {
  try {
    const res = await fetch('/api/results/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId, status })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Status updated to: ${status}`, 'success');
    }
  } catch (err) {
    showToast('Failed to update status', 'error');
  }
}
