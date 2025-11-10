const crypto = require('crypto');

const generateTicketId = () => {
  const prefix = 'TICKET';
  const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${randomBytes}`;
};

module.exports = generateTicketId;

