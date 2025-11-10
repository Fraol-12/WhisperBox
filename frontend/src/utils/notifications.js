// Enhanced notification system
let notificationId = 0;

export const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div');
  notification.id = `notification-${notificationId++}`;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'polite');
  
  const typeStyles = {
    success: 'bg-green-500 text-white border-green-600',
    error: 'bg-red-500 text-white border-red-600',
    info: 'bg-blue-500 text-white border-blue-600',
    warning: 'bg-yellow-500 text-white border-yellow-600',
  };
  
  const iconSvg = {
    success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>',
    error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>',
    info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>',
  };
  
  notification.className = `
    fixed top-4 right-4 z-50 
    px-6 py-4 rounded-lg shadow-large 
    border-l-4 transform translate-x-full 
    transition-all duration-300 ease-out
    flex items-center gap-3
    max-w-md
    ${typeStyles[type] || typeStyles.info}
  `;
  
  notification.innerHTML = `
    <div class="flex-shrink-0">
      ${iconSvg[type] || iconSvg.info}
    </div>
    <div class="flex-1 text-sm font-medium break-words">
      ${message}
    </div>
    <button 
      class="flex-shrink-0 ml-2 hover:opacity-80 transition-opacity"
      aria-label="Close notification"
      onclick="this.parentElement.remove()"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  `;

  document.body.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });

  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
};

