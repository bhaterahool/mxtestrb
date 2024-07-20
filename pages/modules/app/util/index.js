export const getApplicationFromPath = (path, config) =>
  config.applications.find(application => application.path === path)

export const isApplicationAccessible = (application, allowedApplications) => {
  if (!application) return false

  return allowedApplications.some(a => a.code === application.code)
}
