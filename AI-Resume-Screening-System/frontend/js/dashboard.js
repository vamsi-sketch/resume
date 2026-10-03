/**
 * Recruiter Dashboard Client Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const statsRes = await fetch('/api/stats');
    const statsData = await statsRes.json();

    if (statsData.success && statsData.stats) {
      const { total_resumes, candidates_screened, average_match_score, shortlisted_candidates, recent_applications } = statsData.stats;
      
      const elTotal = document.getElementById('stat-total-resumes');
      const elScreened = document.getElementById('stat-candidates-screened');
      const elAvg = document.getElementById('stat-avg-score');
      const elShortlisted = document.getElementById('stat-shortlisted');

      if (elTotal) elTotal.innerText = total_resumes;
      if (elScreened) elScreened.innerText = candidates_screened;
      if (elAvg) elAvg.innerText = `${average_match_score}%`;
      if (elShortlisted) elShortlisted.innerText = shortlisted_candidates;

      renderRecentTable(recent_applications || []);
    }
  } catch (err) {
    console.error('Failed to load dashboard statistics:', err);
  }
}

function renderRecentTable(candidates) {
  const tbody = document.getElementById('recent-table-body');
  if (!tbody) return;

  if (candidates.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 32px;">No candidate applications found yet. Upload resumes to get started.</td></tr>`;
    return;
  }

  tbody.innerHTML = candidates.map(c => `
    <tr>
      <td>
        <span class="candidate-row-name">${c.name}</span>
        <span class="candidate-row-email">${c.email}</span>
      </td>
      <td>
        <span class="badge badge-primary">${c.file_type ? c.file_type.toUpperCase() : 'PDF'}</span>
        <span style="font-size: 12px; color: #64748b; margin-left: 4px;">${c.resume_file || ''}</span>
      </td>
      <td><strong>${c.experience} yrs</strong></td>
      <td>
        <span class="badge ${c.status === 'Shortlisted by Recruiter' ? 'badge-success' : 'badge-warning'}">${c.status || 'Review'}</span>
      </td>
      <td>
        <a href="candidate.html?id=${c.candidate_id}" class="btn btn-secondary" style="padding: 4px 10px; font-size: 12px;">View Profile</a>
      </td>
    </tr>
  `).join('');
}
