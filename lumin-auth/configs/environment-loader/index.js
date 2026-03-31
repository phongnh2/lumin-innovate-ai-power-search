class EnvironmentLoader {
  getJson() {
    const branch = process.env.NEXT_PUBLIC_ENVIRONMENT_NAME;
    switch (branch) {
      case 'develop':
        return require('./develop.json');
      case 'staging':
        return require('./staging.json');
      case 'sandbox':
        return require('./sandbox.json');
      case 'production':
        return require('./production.json');
      default:
        return null;
    }
  }
}

const environmentLoader = new EnvironmentLoader();
module.exports = { environmentLoader };
