export const validateTicketId = ticketid =>
  new RegExp('(^[S][0-9]{8})|(^[0-9]{4,8})', 'g').test(ticketid)
