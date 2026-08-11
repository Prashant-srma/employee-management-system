const Notification = require('../models/Notification');
async function createNotification({ user, title, message, type = 'info' }) {
  return Notification.create({ user, title, message, type });
}
module.exports = { createNotification };
