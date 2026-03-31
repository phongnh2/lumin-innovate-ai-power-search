export const getOAuth2Ref = (ref: string | null) => {
  if (!ref) {
    return '3rd_party';
  }
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (ref) {
    case 'slack':
      return 'integration_slack';
    case 'zapier':
      return 'integration_zapier';
    case 'gmail_addon':
      return 'integration_gmail_add_on';
    case 'drive_addon':
      return 'integration_drive_add_on';
    case 'hubspot':
      return 'integration_hubspot';
    case 'monday':
      return 'integration_monday';
    case 'asana':
      return 'integration_asana';
    case 'stripe':
      return 'integration_stripe';
    case 'pipedrive':
      return 'integration_pipedrive';
    case 'zoho':
      return 'integration_zoho';
    case 'make':
      return 'integration_make';
    case 'zendesk_sell':
      return 'integration_zendesk_sell';
    case 'microsoft':
      return 'integration_microsoft';
    case 'zendesk':
      return 'integration_zendesk';
    case 'mcp':
      return 'integration_mcp';
    default:
      break;
  }
  return 'mobile';
};
