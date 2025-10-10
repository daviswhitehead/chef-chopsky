// Global teardown for integration tests
module.exports = async () => {
  if (global.__SERVICE_MANAGER__) {
    await global.__SERVICE_MANAGER__.stopServices();
  }
};
