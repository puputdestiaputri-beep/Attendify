/* Admin Panel Javascript Settings */

document.addEventListener('DOMContentLoaded', () => {
    // Topbar Clock
    const clockEl = document.getElementById('topbarTime');
    if (clockEl) {
        const updateClock = () => {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('id-ID', { hour12: false });
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    // Sidebar Toggle
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn && sidebar && overlay) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        });
    }

    // Auto dismiss alerts
    setTimeout(() => {
        const alerts = document.querySelectorAll('.alert-dismissible');
        alerts.forEach(alert => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 4000);
});

// Toast notification helper
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icon = type === 'success' ? 'check-circle' : (type === 'danger' ? 'x-circle' : 'info-circle');
    
    const toastHtml = `
    <div class="toast align-items-center text-bg-${type} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body"><i class="bi bi-${icon} me-2"></i>${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>`;
    
    const temp = document.createElement('div');
    temp.innerHTML = toastHtml;
    const toastEl = temp.firstElementChild;
    container.appendChild(toastEl);
    
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.remove(), 300);
    }, 4000);
};
