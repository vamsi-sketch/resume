/**
 * Resume Upload Client Logic
 */
let selectedFiles = [];

document.addEventListener('DOMContentLoaded', async () => {
  loadJobsSelect();
  setupDropzone();
});

async function loadJobsSelect() {
  const select = document.getElementById('target-job-select');
  if (!select) return;

  try {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    if (data.jobs && data.jobs.length > 0) {
      select.innerHTML = data.jobs.map(j => `
        <option value="${j.job_id}">${j.title} (${j.department || 'General'})</option>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load jobs list:', err);
  }
}

function setupDropzone() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--primary)';
    dropzone.style.backgroundColor = 'var(--primary-light)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'var(--border-color)';
    dropzone.style.backgroundColor = '#fff';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--border-color)';
    dropzone.style.backgroundColor = '#fff';
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
  });
}

function handleFiles(files) {
  const allowed = ['.pdf', '.docx'];
  for (const file of files) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (allowed.includes(ext)) {
      selectedFiles.push(file);
    } else {
      showToast(`${file.name}: Only PDF and DOCX formats allowed.`, 'error');
    }
  }
  renderFileList();
}

function renderFileList() {
  const container = document.getElementById('file-queue-container');
  const uploadBtn = document.getElementById('btn-start-upload');
  if (!container) return;

  if (selectedFiles.length === 0) {
    container.innerHTML = '';
    if (uploadBtn) uploadBtn.disabled = true;
    return;
  }

  if (uploadBtn) uploadBtn.disabled = false;

  container.innerHTML = `
    <div style="margin-top: 16px;">
      <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Files Ready to Process (${selectedFiles.length}):</h4>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${selectedFiles.map((f, i) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge badge-primary">${f.name.split('.').pop().toUpperCase()}</span>
              <span style="font-size: 13px; font-weight: 500;">${f.name}</span>
              <span style="font-size: 11px; color: #94a3b8;">(${(f.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button onclick="removeFile(${i})" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 13px;">Remove</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

window.removeFile = function(index) {
  selectedFiles.splice(index, 1);
  renderFileList();
};

async function uploadFiles() {
  if (selectedFiles.length === 0) return;

  const btn = document.getElementById('btn-start-upload');
  const targetJobId = document.getElementById('target-job-select')?.value;
  const statusBox = document.getElementById('upload-status-box');

  const formData = new FormData();
  for (const file of selectedFiles) {
    formData.append('resumes', file);
  }
  if (targetJobId) {
    formData.append('job_id', targetJobId);
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Extracting text & matching skills...';
    }
    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = '<div style="color: #4f46e5; font-size: 13px;">Processing resumes with NLP extraction pipeline...</div>';
    }

    const res = await fetch('/api/resumes/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast(`Successfully processed ${data.candidates.length} resume(s)!`, 'success');
      selectedFiles = [];
      renderFileList();
      setTimeout(() => {
        window.location.href = 'results.html';
      }, 1200);
    } else {
      showToast(data.error || 'Upload failed', 'error');
    }
  } catch (err) {
    showToast('Server communication failed', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Upload & Run AI Screening';
    }
  }
}
