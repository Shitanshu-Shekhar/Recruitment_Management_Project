import api from './axios';

// Resume downloads must go through Axios so the authenticated Bearer token is
// attached. A plain <a href> drops that token and targets the static frontend.
export const openResumeFile = async (filename) => {
  const preview = window.open('', '_blank');

  try {
    const response = await api.get(`/profile/resume-file/${encodeURIComponent(filename)}`, {
      responseType: 'blob'
    });
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || response.data.type || 'application/octet-stream'
    });
    const objectUrl = URL.createObjectURL(blob);

    if (preview) {
      preview.location.href = objectUrl;
    } else {
      const link = document.createElement('a');
      link.href = objectUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    preview?.close();
    throw error;
  }
};
