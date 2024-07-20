export const ServiceRequestTypes = {
  RW: 'Reactive',
  CH: 'Chase',
  RC: 'Recall',
  IN: 'Information',
  RM: 'Remedial',
  CW: 'Corrective',
  PM: 'Manual PM',
  FO: 'Follow On',
  QR: 'Quote',
  CP: 'Complaint',
  CC: 'Compliment'
}

export const UsableRequestTypes = {
  RW: 'Reactive',
  CH: 'Chase',
  RC: 'Recall',
  IN: 'Information',
  QR: 'Quote',
  CP: 'Complaint',
  CC: 'Compliment'
}

export const SRStatusList = {
  CLOSED: 'Closed',
  QUEUED: 'Queued',
  RESOLVED: 'Resolved',
  INPRG: 'InProgress',
  WAPPR: 'Waiting for Approval',
  APPR: 'Approved',
  WCLIENTAPPR: 'Waiting for Client Approval',
  WSCHEDULE: 'Waiting to be Scheduled',
  ASSIGNED: 'Assigned'
}

export const ApprovalStatues = {
  APPROVED: 'APPROVED',
  REASSIGNED: 'REASSIGNED',
  REJECTED: 'REJECTED',
  WAITAPP: 'WAITAPP',
  INVALIDCC: 'INVALIDCC'
}

export const priorityList = {
  1: 'P1 Highest',
  2: 'P2 High',
  3: 'P3 Medium',
  4: 'P4 Low',
  5: 'P5 Routine'
}

export const AdvancedSearchOptionalFields = {
  Status: true,
  EndCustomer: true,
  Customer: true,
  Reporteddate: true,
  Type: true,
  Ticketid: false,
  Priority: false,
  Asset: false,
  Reportedby: false,
  Reportedbyemail: false,
  Location: false,
  pelclientref: false,
  Afftected: false,
  Affectedemail: false
}

export const AdvancedSearchOptionalCpFields = {
  Status: true,
  Reporteddate: true,
  Type: true,
  Ticketid: true,
  Priority: true,
  Asset: true,
  Reportedby: true,
  Reportedbyemail: true,
  Location: true,
  pelclientref: true,
  Afftected: true,
  Affectedemail: true
}

export const AdvancedSearchOptionalSubconFields = {
  Assignmentid: true,
  Wonum: true,
  AssignmentStatus: true,
  Woworktype: true,
  ponum: true,
  Postcode: true,
  Streetaddress: true,
  CreatedDate: true,
  TargetStartDate: true,
  TargetFinishDate: true,
  ActualStartDate: true,
  ActualFinishDate: true,
  EstimatedStartDate: true,
  EstimatedFinishDate: true
}

export const getServiceRequestType = type => {
  return ServiceRequestTypes[type] || type || 'Unknown'
}


export const oslcProps = ['select', 'where', 'searchTerms', 'orderBy']
