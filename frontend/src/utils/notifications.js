// Simple notification system
let notificationId = 0;

export const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div');
  notification.id = `notification-${notificationId++}`;
  notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
    type === 'success' 
      ? 'bg-green-500 text-white' 
      : type === 'error'
      ? 'bg-red-500 text-white'
      : 'bg-blue-500 text-white'
  }`;
  notification.textContent = message;
  notification.style.maxWidth = '400px';
  notification.style.wordWrap = 'break-word';

  document.body.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

