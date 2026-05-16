import googleAdapter from './google.js';
import slackAdapter from './slack.js';
import notionAdapter from './notion.js';
import googleSheetsAdapter from './google-sheets.js';
import hubspotAdapter from './hubspot.js';

export const integrationAdapters = {
  gmail: googleAdapter,
  'google-sheets': googleSheetsAdapter,
  slack: slackAdapter,
  notion: notionAdapter,
  hubspot: hubspotAdapter,
};

export {
  googleAdapter,
  slackAdapter,
  notionAdapter,
  googleSheetsAdapter,
  hubspotAdapter,
};