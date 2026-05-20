import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error'],
    });
  }
  return prisma;
}

function getUserIdFromToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return decoded.split(':')[0];
  } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { resource, id, page, limit, workflowId, status } = req.query;
  const userId = getUserIdFromToken(req.headers.authorization);

  res.setHeader('Content-Type', 'application/json');

  try {
    switch (resource) {
      case 'integrations': {
        const integrations = [
          {
            id: 'google_sheets', slug: 'google-sheets', name: 'Google Sheets', description: 'Create, edit, and collaborate on spreadsheets online', icon: '📊', category: 'Spreadsheets', authType: 'oauth2',
            triggers: [
              { id: 'new_row', name: 'New Row Added', description: 'Triggers when a new row is added to a spreadsheet', type: 'polling', sample: { row: 1, data: { A: 'Value', B: 'Data' } } },
              { id: 'new_or_updated_row', name: 'New or Updated Row', description: 'Triggers when a row is added or modified', type: 'polling', sample: { row: 1, data: { A: 'Value' }, event: 'new' } },
              { id: 'new_column', name: 'New Column Added', description: 'Triggers when a new column is added', type: 'polling', sample: { column: 'D', header: 'New Column' } },
              { id: 'new_sheet', name: 'New Sheet Created', description: 'Triggers when a new sheet/tab is created', type: 'polling', sample: { sheetName: 'Sheet2', spreadsheetId: 'abc123' } },
              { id: 'spreadsheet_updated', name: 'Spreadsheet Updated', description: 'Triggers when any cell is modified', type: 'polling', sample: { modifiedRange: 'A1:D10', modifiedCells: 5 } },
              { id: 'cell_matching', name: 'Cell Value Matches', description: 'Triggers when a cell matches specific criteria', type: 'polling', sample: { cell: 'A1', value: 'Ready', sheet: 'Sheet1' } },
              { id: 'new_form_response', name: 'New Form Response', description: 'Triggers when a Google Form receives a new response', type: 'polling', sample: { timestamp: '2024-01-01', responses: ['Yes', 'No'] } },
              { id: 'spreadsheet_shared', name: 'Spreadsheet Shared', description: 'Triggers when spreadsheet is shared with someone', type: 'polling', sample: { sharedWith: 'user@email.com', permission: 'editor' } },
              { id: 'comment_added', name: 'Comment Added', description: 'Triggers when a comment is added to a cell', type: 'polling', sample: { cell: 'B2', comment: 'Needs review', author: 'John' } },
              { id: 'row_deleted', name: 'Row Deleted', description: 'Triggers when a row is deleted', type: 'polling', sample: { rowNumber: 5, spreadsheetId: 'abc' } },
              { id: 'specific_value_appears', name: 'Specific Value Appears', description: 'Triggers when a specific value appears in a column', type: 'polling', sample: { column: 'C', value: 'Completed', row: 10 } },
              { id: 'empty_row_detected', name: 'Empty Row Detected', description: 'Triggers when a row becomes empty', type: 'polling', sample: { row: 5, spreadsheetId: 'abc' } },
            ],
            actions: [
              { id: 'create_row', name: 'Create Row', description: 'Add a new row to a spreadsheet', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'sheet', type: 'string', required: true, label: 'Sheet Name' }, { name: 'values', type: 'object', required: true, label: 'Row Values (JSON)' }] },
              { id: 'update_row', name: 'Update Row', description: 'Update an existing row', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'row', type: 'number', required: true, label: 'Row Number' }, { name: 'values', type: 'object', required: true, label: 'Row Values (JSON)' }] },
              { id: 'update_cell', name: 'Update Cell', description: 'Update a specific cell', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'cell', type: 'string', required: true, label: 'Cell (e.g., A1)' }, { name: 'value', type: 'string', required: true, label: 'Value' }] },
              { id: 'find_row', name: 'Find Row', description: 'Find a row by cell value', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'column', type: 'string', required: true, label: 'Column' }, { name: 'value', type: 'string', required: true, label: 'Search Value' }] },
              { id: 'delete_row', name: 'Delete Row', description: 'Delete a specific row', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'sheet', type: 'string', required: true, label: 'Sheet Name' }, { name: 'row', type: 'number', required: true, label: 'Row Number' }] },
              { id: 'insert_row', name: 'Insert Row', description: 'Insert a new row at specific position', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'sheet', type: 'string', required: true, label: 'Sheet Name' }, { name: 'row', type: 'number', required: true, label: 'Insert at Row' }, { name: 'values', type: 'object', required: false, label: 'Row Values (JSON)' }] },
              { id: 'copy_row', name: 'Copy Row', description: 'Copy a row to another sheet', inputFields: [{ name: 'sourceSpreadsheet', type: 'string', required: true, label: 'Source Spreadsheet ID' }, { name: 'sourceRow', type: 'number', required: true, label: 'Source Row' }, { name: 'targetSpreadsheet', type: 'string', required: true, label: 'Target Spreadsheet ID' }, { name: 'targetSheet', type: 'string', required: true, label: 'Target Sheet Name' }] },
              { id: 'create_sheet', name: 'Create Sheet', description: 'Create a new sheet/tab', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'title', type: 'string', required: true, label: 'Sheet Title' }] },
              { id: 'delete_sheet', name: 'Delete Sheet', description: 'Delete a sheet/tab', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'title', type: 'string', required: true, label: 'Sheet Title' }] },
              { id: 'add_column', name: 'Add Column', description: 'Add a new column with header', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'sheet', type: 'string', required: true, label: 'Sheet Name' }, { name: 'column', type: 'string', required: true, label: 'Column Letter' }, { name: 'header', type: 'string', required: true, label: 'Column Header' }] },
              { id: 'lookup_spreadsheet', name: 'Lookup Spreadsheet Row', description: 'Find and return entire row data', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'sheet', type: 'string', required: true, label: 'Sheet Name' }, { name: 'column', type: 'string', required: true, label: 'Lookup Column' }, { name: 'value', type: 'string', required: true, label: 'Lookup Value' }] },
              { id: 'get_all_rows', name: 'Get All Rows', description: 'Retrieve all rows from a sheet', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'sheet', type: 'string', required: true, label: 'Sheet Name' }, { name: 'limit', type: 'number', required: false, label: 'Max Rows' }] },
              { id: 'duplicate_sheet', name: 'Duplicate Sheet', description: 'Duplicate an existing sheet', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'sourceSheet', type: 'string', required: true, label: 'Source Sheet' }, { name: 'newSheetName', type: 'string', required: true, label: 'New Sheet Name' }] },
              { id: 'batch_update', name: 'Batch Update Cells', description: 'Update multiple cells at once', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'data', type: 'text', required: true, label: 'Data (JSON array of {range, value})' }] },
              { id: 'share_spreadsheet', name: 'Share Spreadsheet', description: 'Share spreadsheet with someone', inputFields: [{ name: 'spreadsheet', type: 'string', required: true, label: 'Spreadsheet ID' }, { name: 'email', type: 'string', required: true, label: 'Email Address' }, { name: 'role', type: 'select', required: true, label: 'Role', options: ['reader', 'writer', 'commenter'] }] },
            ]
          },
          {
            id: 'gmail', slug: 'gmail', name: 'Gmail', description: 'Send and receive emails through your Google account', icon: '📧', category: 'Communication', authType: 'oauth2',
            triggers: [
              { id: 'new_email', name: 'New Email', description: 'Triggers when a new email arrives', type: 'polling', sample: { from: 'sender@example.com', subject: 'Hello', body: 'Email content', date: '2024-01-01' } },
              { id: 'new_email_from', name: 'New Email From Specific Sender', description: 'Triggers when email from specific sender arrives', type: 'polling', sample: { from: 'specific@email.com', subject: 'Update', body: 'Content' } },
              { id: 'new_email_matching', name: 'New Email Matching Search', description: 'Triggers when email matches search criteria', type: 'polling', sample: { subject: 'Invoice', hasAttachment: true, from: 'billing@company.com' } },
              { id: 'new_attachment', name: 'New Email with Attachment', description: 'Triggers when email has a new attachment', type: 'polling', sample: { from: 'sender@example.com', subject: 'File attached', attachment: 'document.pdf' } },
              { id: 'email_starred', name: 'Email Starred', description: 'Triggers when an email is starred', type: 'polling', sample: { from: 'user@email.com', subject: 'Important', starred: true } },
              { id: 'new_label', name: 'Email Labeled', description: 'Triggers when email is labeled', type: 'polling', sample: { from: 'user@email.com', label: 'Work', subject: 'Report' } },
              { id: 'email_unread', name: 'New Unread Email', description: 'Triggers when new unread email arrives', type: 'polling', sample: { from: 'sender@example.com', subject: 'New message', unread: true } },
              { id: 'email_clicked', name: 'Email Link Clicked', description: 'Triggers when a link in email is clicked (with tracking)', type: 'polling', sample: { to: 'recipient@email.com', link: 'https://example.com/click' } },
              { id: 'email_opened', name: 'Email Opened', description: 'Triggers when email is opened (with tracking)', type: 'polling', sample: { to: 'recipient@email.com', subject: 'Newsletter', opened: true } },
            ],
            actions: [
              { id: 'send_email', name: 'Send Email', description: 'Send an email to any recipient', inputFields: [{ name: 'to', type: 'string', required: true, label: 'To' }, { name: 'subject', type: 'string', required: true, label: 'Subject' }, { name: 'body', type: 'text', required: true, label: 'Body (HTML supported)' }, { name: 'cc', type: 'string', required: false, label: 'CC' }, { name: 'bcc', type: 'string', required: false, label: 'BCC' }, { name: 'fromName', type: 'string', required: false, label: 'From Name' }] },
              { id: 'send_html_email', name: 'Send HTML Email', description: 'Send rich HTML formatted email', inputFields: [{ name: 'to', type: 'string', required: true, label: 'To' }, { name: 'subject', type: 'string', required: true, label: 'Subject' }, { name: 'html', type: 'text', required: true, label: 'HTML Body' }, { name: 'plainText', type: 'text', required: false, label: 'Plain Text Fallback' }] },
              { id: 'reply_to_email', name: 'Reply to Email', description: 'Reply to an existing email', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }, { name: 'body', type: 'text', required: true, label: 'Body' }, { name: 'cc', type: 'string', required: false, label: 'CC' }] },
              { id: 'forward_email', name: 'Forward Email', description: 'Forward an email to another address', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }, { name: 'to', type: 'string', required: true, label: 'Forward To' }, { name: 'addComment', type: 'text', required: false, label: 'Add Comment' }] },
              { id: 'mark_as_read', name: 'Mark Email as Read', description: 'Mark an email as read', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }] },
              { id: 'mark_as_unread', name: 'Mark Email as Unread', description: 'Mark an email as unread', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }] },
              { id: 'add_label', name: 'Add Label to Email', description: 'Add a label/tag to email', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }, { name: 'label', type: 'string', required: true, label: 'Label Name' }] },
              { id: 'remove_label', name: 'Remove Label from Email', description: 'Remove a label from email', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }, { name: 'label', type: 'string', required: true, label: 'Label Name' }] },
              { id: 'star_email', name: 'Star Email', description: 'Star an email', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }] },
              { id: 'archive_email', name: 'Archive Email', description: 'Archive an email', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }] },
              { id: 'trash_email', name: 'Move Email to Trash', description: 'Move email to trash', inputFields: [{ name: 'threadId', type: 'string', required: true, label: 'Thread ID' }] },
              { id: 'create_draft', name: 'Create Draft', description: 'Create an email draft', inputFields: [{ name: 'to', type: 'string', required: true, label: 'To' }, { name: 'subject', type: 'string', required: true, label: 'Subject' }, { name: 'body', type: 'text', required: true, label: 'Body' }] },
              { id: 'send_draft', name: 'Send Draft', description: 'Send an existing draft', inputFields: [{ name: 'draftId', type: 'string', required: true, label: 'Draft ID' }] },
            ]
          },
          {
            id: 'slack', slug: 'slack', name: 'Slack', description: 'Team communication and collaboration platform', icon: '💬', category: 'Communication', authType: 'oauth2',
            triggers: [
              { id: 'new_message', name: 'New Message in Channel', description: 'Triggers when a message is posted to a channel', type: 'webhook', sample: { channel: '#general', user: 'user', text: 'Hello!', ts: '1234567890' } },
              { id: 'new_message_keyword', name: 'New Message with Keyword', description: 'Triggers when message contains specific keyword', type: 'webhook', sample: { channel: '#alerts', text: 'ERROR: something failed', user: 'system' } },
              { id: 'new_mention', name: 'New Mention', description: 'Triggers when you are mentioned', type: 'webhook', sample: { user: 'john', text: '@bot help needed', mentioned: true } },
              { id: 'new_direct_message', name: 'New Direct Message', description: 'Triggers when you receive a DM', type: 'webhook', sample: { user: 'john', text: 'Hello bot', dm: true } },
              { id: 'new_reaction', name: 'New Reaction Added', description: 'Triggers when reaction is added to your message', type: 'webhook', sample: { channel: '#general', user: 'john', emoji: '👍', messageTs: '123456' } },
              { id: 'channel_created', name: 'New Channel Created', description: 'Triggers when a new channel is created', type: 'webhook', sample: { channel: '#new-channel', createdBy: 'admin', createdAt: '2024-01-01' } },
              { id: 'user_joined_channel', name: 'User Joined Channel', description: 'Triggers when user joins a channel', type: 'webhook', sample: { user: 'newuser', channel: '#general', invitedBy: 'admin' } },
              { id: 'file_shared', name: 'File Shared', description: 'Triggers when a file is shared in channel', type: 'webhook', sample: { user: 'john', file: 'report.pdf', channel: '#files' } },
              { id: 'thread_reply', name: 'Thread Reply', description: 'Triggers when someone replies to your thread', type: 'webhook', sample: { user: 'jane', text: 'Good idea!', threadTs: '123456' } },
            ],
            actions: [
              { id: 'send_message', name: 'Send Message', description: 'Post a message to a Slack channel', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel (name or ID)' }, { name: 'text', type: 'text', required: true, label: 'Message' }, { name: 'username', type: 'string', required: false, label: 'Bot Name' }, { name: 'iconEmoji', type: 'string', required: false, label: 'Icon (emoji)' }] },
              { id: 'send_dm', name: 'Send Direct Message', description: 'Send DM to a user', inputFields: [{ name: 'user', type: 'string', required: true, label: 'User (email or ID)' }, { name: 'text', type: 'text', required: true, label: 'Message' }] },
              { id: 'send_slack_message', name: 'Send Rich Message (Block Kit)', description: 'Send formatted message with blocks', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel' }, { name: 'blocks', type: 'text', required: true, label: 'Block Kit JSON' }, { name: 'text', type: 'string', required: false, label: 'Fallback Text' }] },
              { id: 'create_channel', name: 'Create Channel', description: 'Create a new Slack channel', inputFields: [{ name: 'name', type: 'string', required: true, label: 'Channel Name' }, { name: 'isPrivate', type: 'boolean', required: false, label: 'Private Channel?' }] },
              { id: 'invite_to_channel', name: 'Invite User to Channel', description: 'Invite user to a channel', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel' }, { name: 'user', type: 'string', required: true, label: 'User (email or ID)' }] },
              { id: 'archive_channel', name: 'Archive Channel', description: 'Archive a channel', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel' }] },
              { id: 'rename_channel', name: 'Rename Channel', description: 'Rename a channel', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel' }, { name: 'newName', type: 'string', required: true, label: 'New Name' }] },
              { id: 'set_channel_topic', name: 'Set Channel Topic', description: 'Set channel topic/description', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel' }, { name: 'topic', type: 'string', required: true, label: 'Topic' }] },
              { id: 'set_channel_purpose', name: 'Set Channel Purpose', description: 'Set channel purpose', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel' }, { name: 'purpose', type: 'string', required: true, label: 'Purpose' }] },
              { id: 'upload_file', name: 'Upload File', description: 'Upload a file to channel', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel' }, { name: 'fileUrl', type: 'string', required: true, label: 'File URL' }, { name: 'title', type: 'string', required: false, label: 'Title' }, { name: 'comment', type: 'text', required: false, label: 'Initial Comment' }] },
              { id: 'add_reaction', name: 'Add Reaction', description: 'Add emoji reaction to message', inputFields: [{ name: 'channel', type: 'string', required: true, label: 'Channel' }, { name: 'timestamp', type: 'string', required: true, label: 'Message Timestamp' }, { name: 'emoji', type: 'string', required: true, label: 'Emoji (without :)' }] },
              { id: 'open_dialog', name: 'Open Dialog', description: 'Open an interactive dialog', inputFields: [{ name: 'triggerId', type: 'string', required: true, label: 'Trigger ID' }, { name: 'dialog', type: 'text', required: true, label: 'Dialog JSON' }, { name: 'title', type: 'string', required: true, label: 'Dialog Title' }] },
              { id: 'find_user', name: 'Find User', description: 'Look up user by email or name', inputFields: [{ name: 'query', type: 'string', required: true, label: 'Email or Name' }] },
              { id: 'get_user_info', name: 'Get User Info', description: 'Get detailed user information', inputFields: [{ name: 'user', type: 'string', required: true, label: 'User ID or Email' }] },
            ]
          },
          {
            id: 'notion', slug: 'notion', name: 'Notion', description: 'All-in-one workspace for notes, tasks, and collaboration', icon: '📝', category: 'Productivity', authType: 'oauth2',
            triggers: [
              { id: 'new_page', name: 'New Page Created', description: 'Triggers when a new page is created', type: 'polling', sample: { title: 'Page Title', url: 'https://notion.so/page', createdAt: '2024-01-01' } },
              { id: 'page_updated', name: 'Page Updated', description: 'Triggers when a page is modified', type: 'polling', sample: { title: 'Page Title', url: 'https://notion.so/page', updatedAt: '2024-01-01', changes: ['content', 'properties'] } },
              { id: 'page_deleted', name: 'Page Deleted', description: 'Triggers when a page is deleted', type: 'polling', sample: { title: 'Old Page', deletedAt: '2024-01-01' } },
              { id: 'new_database_item', name: 'New Database Item', description: 'Triggers when new item added to database', type: 'polling', sample: { database: 'Tasks', title: 'New Task', properties: { Status: 'To Do' } } },
              { id: 'database_item_updated', name: 'Database Item Updated', description: 'Triggers when database item properties change', type: 'polling', sample: { database: 'Tasks', title: 'Task 1', changes: ['Status', 'Assignee'] } },
              { id: 'new_comment', name: 'New Comment', description: 'Triggers when comment is added to page', type: 'polling', sample: { page: 'Page Title', comment: 'Great work!', author: 'John' } },
              { id: 'page_archived', name: 'Page Archived', description: 'Triggers when page is archived', type: 'polling', sample: { title: 'Old Page', archived: true } },
              { id: 'database_property_changed', name: 'Database Property Changed', description: 'Triggers when database schema changes', type: 'polling', sample: { database: 'CRM', property: 'New Field', type: 'select' } },
              { id: 'mention_received', name: 'Page Mentioned', description: 'Triggers when your workspace is mentioned', type: 'polling', sample: { page: 'Discussion', mentionedBy: 'John', mentionType: 'page_mention' } },
            ],
            actions: [
              { id: 'create_page', name: 'Create Page', description: 'Create a new page in a database or workspace', inputFields: [{ name: 'parentId', type: 'string', required: true, label: 'Parent Page/Database ID' }, { name: 'title', type: 'string', required: true, label: 'Page Title' }, { name: 'properties', type: 'object', required: false, label: 'Properties (JSON)' }, { name: 'content', type: 'text', required: false, label: 'Page Content (Markdown)' }] },
              { id: 'create_database', name: 'Create Database', description: 'Create a new database', inputFields: [{ name: 'parentId', type: 'string', required: true, label: 'Parent Page ID' }, { name: 'title', type: 'string', required: true, label: 'Database Title' }, { name: 'properties', type: 'text', required: true, label: 'Properties Schema (JSON)' }] },
              { id: 'update_page', name: 'Update Page', description: 'Update an existing page', inputFields: [{ name: 'pageId', type: 'string', required: true, label: 'Page ID' }, { name: 'properties', type: 'object', required: false, label: 'Properties (JSON)' }, { name: 'content', type: 'text', required: false, label: 'Content to Append (Markdown)' }] },
              { id: 'archive_page', name: 'Archive Page', description: 'Archive a page (soft delete)', inputFields: [{ name: 'pageId', type: 'string', required: true, label: 'Page ID' }] },
              { id: 'restore_page', name: 'Restore Page', description: 'Restore an archived page', inputFields: [{ name: 'pageId', type: 'string', required: true, label: 'Page ID' }] },
              { id: 'delete_page', name: 'Delete Page', description: 'Permanently delete a page', inputFields: [{ name: 'pageId', type: 'string', required: true, label: 'Page ID' }] },
              { id: 'add_database_item', name: 'Add Database Item', description: 'Add new item to database', inputFields: [{ name: 'databaseId', type: 'string', required: true, label: 'Database ID' }, { name: 'properties', type: 'object', required: true, label: 'Properties (JSON)' }] },
              { id: 'update_database_item', name: 'Update Database Item', description: 'Update item in database', inputFields: [{ name: 'pageId', type: 'string', required: true, label: 'Item/Page ID' }, { name: 'properties', type: 'object', required: true, label: 'Properties (JSON)' }] },
              { id: 'query_database', name: 'Query Database', description: 'Search/query database items', inputFields: [{ name: 'databaseId', type: 'string', required: true, label: 'Database ID' }, { name: 'filter', type: 'text', required: false, label: 'Filter (JSON)' }, { name: 'sorts', type: 'text', required: false, label: 'Sorts (JSON)' }, { name: 'limit', type: 'number', required: false, label: 'Max Results' }] },
              { id: 'add_comment', name: 'Add Comment', description: 'Add comment to a page', inputFields: [{ name: 'pageId', type: 'string', required: true, label: 'Page ID' }, { name: 'comment', type: 'text', required: true, label: 'Comment Text' }, { name: 'discussionId', type: 'string', required: false, label: 'Discussion ID (reply)' }] },
              { id: 'get_page', name: 'Get Page', description: 'Retrieve page details', inputFields: [{ name: 'pageId', type: 'string', required: true, label: 'Page ID' }] },
              { id: 'get_database', name: 'Get Database', description: 'Retrieve database schema and items', inputFields: [{ name: 'databaseId', type: 'string', required: true, label: 'Database ID' }] },
              { id: 'duplicate_page', name: 'Duplicate Page', description: 'Create a copy of a page', inputFields: [{ name: 'pageId', type: 'string', required: true, label: 'Page ID' }, { name: 'newParentId', type: 'string', required: true, label: 'New Parent Page ID' }] },
              { id: 'search', name: 'Search Pages', description: 'Search pages by title', inputFields: [{ name: 'query', type: 'string', required: true, label: 'Search Query' }, { name: 'filter', type: 'string', required: false, label: 'Filter by Property' }, { name: 'limit', type: 'number', required: false, label: 'Max Results' }] },
            ]
          },
          {
            id: 'hubspot', slug: 'hubspot', name: 'HubSpot', description: 'CRM, marketing, and sales automation platform', icon: '🔷', category: 'CRM', authType: 'oauth2',
            triggers: [
              { id: 'new_contact', name: 'New Contact', description: 'Triggers when a new contact is created', type: 'polling', sample: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', createdAt: '2024-01-01' } },
              { id: 'contact_updated', name: 'Contact Updated', description: 'Triggers when contact properties change', type: 'polling', sample: { firstName: 'John', lastName: 'Doe', changes: ['phone', 'address'], updatedAt: '2024-01-01' } },
              { id: 'contact_deleted', name: 'Contact Deleted', description: 'Triggers when contact is deleted', type: 'polling', sample: { email: 'deleted@example.com', deletedAt: '2024-01-01' } },
              { id: 'new_deal', name: 'New Deal Created', description: 'Triggers when a new deal is created', type: 'polling', sample: { dealName: 'Enterprise Sale', amount: 50000, pipeline: 'Sales Pipeline' } },
              { id: 'deal_stage_changed', name: 'Deal Stage Changed', description: 'Triggers when deal moves to new stage', type: 'polling', sample: { dealName: 'Enterprise Sale', oldStage: 'Qualification', newStage: 'Proposal', amount: 50000 } },
              { id: 'deal_closed', name: 'Deal Closed', description: 'Triggers when deal is closed (won or lost)', type: 'polling', sample: { dealName: 'Enterprise Sale', outcome: 'won', amount: 50000, closedAt: '2024-01-01' } },
              { id: 'deal_updated', name: 'Deal Updated', description: 'Triggers when deal properties change', type: 'polling', sample: { dealName: 'Enterprise Sale', changes: ['amount', 'owner'] } },
              { id: 'new_company', name: 'New Company', description: 'Triggers when a new company is created', type: 'polling', sample: { name: 'Acme Corp', domain: 'acme.com', industry: 'Technology' } },
              { id: 'company_updated', name: 'Company Updated', description: 'Triggers when company properties change', type: 'polling', sample: { name: 'Acme Corp', changes: ['employees', 'revenue'] } },
              { id: 'new_ticket', name: 'New Ticket', description: 'Triggers when support ticket is created', type: 'polling', sample: { subject: 'Login issue', status: 'new', priority: 'high', requester: 'user@email.com' } },
              { id: 'ticket_updated', name: 'Ticket Updated', description: 'Triggers when ticket status changes', type: 'polling', sample: { subject: 'Login issue', oldStatus: 'new', newStatus: 'in_progress' } },
              { id: 'new_engagement', name: 'New Engagement', description: 'Triggers when new email/call/meeting logged', type: 'polling', sample: { type: 'email', contact: 'john@example.com', subject: 'Follow up' } },
              { id: 'form_submitted', name: 'Form Submitted', description: 'Triggers when HubSpot form is submitted', type: 'polling', sample: { formId: 'form123', email: 'user@email.com', fields: { firstName: 'John' } } },
              { id: 'email_opened', name: 'Email Opened', description: 'Triggers when marketing email is opened', type: 'polling', sample: { contact: 'john@example.com', emailId: 'email123', subject: 'Newsletter' } },
              { id: 'email_clicked', name: 'Email Link Clicked', description: 'Triggers when link in email is clicked', type: 'polling', sample: { contact: 'john@example.com', emailId: 'email123', link: 'https://example.com' } },
            ],
            actions: [
              { id: 'create_contact', name: 'Create Contact', description: 'Create a new contact', inputFields: [{ name: 'email', type: 'string', required: true, label: 'Email' }, { name: 'firstname', type: 'string', required: false, label: 'First Name' }, { name: 'lastname', type: 'string', required: false, label: 'Last Name' }, { name: 'phone', type: 'string', required: false, label: 'Phone' }, { name: 'company', type: 'string', required: false, label: 'Company' }, { name: 'properties', type: 'object', required: false, label: 'Additional Properties (JSON)' }] },
              { id: 'update_contact', name: 'Update Contact', description: 'Update contact properties', inputFields: [{ name: 'email', type: 'string', required: true, label: 'Email (identifier)' }, { name: 'properties', type: 'object', required: true, label: 'Properties (JSON)' }] },
              { id: 'delete_contact', name: 'Delete Contact', description: 'Delete a contact', inputFields: [{ name: 'email', type: 'string', required: true, label: 'Email' }] },
              { id: 'get_contact', name: 'Get Contact', description: 'Retrieve contact details', inputFields: [{ name: 'email', type: 'string', required: true, label: 'Email' }] },
              { id: 'search_contacts', name: 'Search Contacts', description: 'Search contacts by property', inputFields: [{ name: 'query', type: 'string', required: true, label: 'Search Query' }, { name: 'limit', type: 'number', required: false, label: 'Max Results' }] },
              { id: 'create_deal', name: 'Create Deal', description: 'Create a new deal', inputFields: [{ name: 'dealname', type: 'string', required: true, label: 'Deal Name' }, { name: 'amount', type: 'number', required: false, label: 'Amount' }, { name: 'pipeline', type: 'string', required: false, label: 'Pipeline' }, { name: 'dealstage', type: 'string', required: false, label: 'Deal Stage' }, { name: 'closedate', type: 'string', required: false, label: 'Close Date' }, { name: 'properties', type: 'object', required: false, label: 'Additional Properties (JSON)' }] },
              { id: 'update_deal', name: 'Update Deal', description: 'Update deal properties', inputFields: [{ name: 'dealId', type: 'string', required: true, label: 'Deal ID' }, { name: 'properties', type: 'object', required: true, label: 'Properties (JSON)' }] },
              { id: 'delete_deal', name: 'Delete Deal', description: 'Delete a deal', inputFields: [{ name: 'dealId', type: 'string', required: true, label: 'Deal ID' }] },
              { id: 'associate_deal_contact', name: 'Associate Deal with Contact', description: 'Link deal to existing contact', inputFields: [{ name: 'dealId', type: 'string', required: true, label: 'Deal ID' }, { name: 'contactEmail', type: 'string', required: true, label: 'Contact Email' }] },
              { id: 'create_company', name: 'Create Company', description: 'Create a new company', inputFields: [{ name: 'name', type: 'string', required: true, label: 'Company Name' }, { name: 'domain', type: 'string', required: false, label: 'Domain' }, { name: 'industry', type: 'string', required: false, label: 'Industry' }, { name: 'properties', type: 'object', required: false, label: 'Additional Properties (JSON)' }] },
              { id: 'update_company', name: 'Update Company', description: 'Update company properties', inputFields: [{ name: 'companyId', type: 'string', required: true, label: 'Company ID or Domain' }, { name: 'properties', type: 'object', required: true, label: 'Properties (JSON)' }] },
              { id: 'create_ticket', name: 'Create Ticket', description: 'Create a support ticket', inputFields: [{ name: 'subject', type: 'string', required: true, label: 'Subject' }, { name: 'content', type: 'text', required: false, label: 'Content' }, { name: 'priority', type: 'select', required: false, label: 'Priority', options: ['low', 'medium', 'high'] }, { name: 'pipeline', type: 'string', required: false, label: 'Pipeline' }] },
              { id: 'update_ticket', name: 'Update Ticket', description: 'Update ticket properties', inputFields: [{ name: 'ticketId', type: 'string', required: true, label: 'Ticket ID' }, { name: 'properties', type: 'object', required: true, label: 'Properties (JSON)' }] },
              { id: 'create_engagement', name: 'Create Engagement', description: 'Log email/call/note', inputFields: [{ name: 'type', type: 'select', required: true, label: 'Type', options: ['EMAIL', 'CALL', 'NOTE', 'MEETING', 'TASK'] }, { name: 'contactEmail', type: 'string', required: false, label: 'Contact Email' }, { name: 'subject', type: 'string', required: false, label: 'Subject' }, { name: 'body', type: 'text', required: false, label: 'Body/Notes' }, { name: 'outcome', type: 'string', required: false, label: 'Outcome (for calls)' }] },
              { id: 'add_to_list', name: 'Add Contact to List', description: 'Add contact to static list', inputFields: [{ name: 'listId', type: 'string', required: true, label: 'List ID' }, { name: 'email', type: 'string', required: true, label: 'Contact Email' }] },
              { id: 'create_contact_list', name: 'Create Contact List', description: 'Create a new static list', inputFields: [{ name: 'name', type: 'string', required: true, label: 'List Name' }, { name: 'description', type: 'text', required: false, label: 'Description' }] },
              { id: 'create_note', name: 'Create Note', description: 'Create a note on contact/company/deal', inputFields: [{ name: 'body', type: 'text', required: true, label: 'Note Content' }, { name: 'contactEmail', type: 'string', required: false, label: 'Contact Email' }, { name: 'dealId', type: 'string', required: false, label: 'Deal ID' }, { name: 'timestamp', type: 'string', required: false, label: 'Timestamp' }] },
              { id: 'get_deals', name: 'Get Deals', description: 'Retrieve deals by stage', inputFields: [{ name: 'pipeline', type: 'string', required: false, label: 'Pipeline' }, { name: 'stage', type: 'string', required: false, label: 'Stage' }, { name: 'limit', type: 'number', required: false, label: 'Max Results' }] },
            ]
          },
          {
            id: 'google_calendar', slug: 'google-calendar', name: 'Google Calendar', description: 'Manage calendars and events', icon: '📅', category: 'Productivity', authType: 'oauth2',
            triggers: [
              { id: 'new_event', name: 'New Event Created', description: 'Triggers when new event is created', type: 'polling', sample: { summary: 'Team Meeting', start: '2024-01-01T10:00:00Z', end: '2024-01-01T11:00:00Z', attendees: ['john@email.com'] } },
              { id: 'event_updated', name: 'Event Updated', description: 'Triggers when event details change', type: 'polling', sample: { summary: 'Team Meeting', changes: ['time', 'location'], updatedAt: '2024-01-01' } },
              { id: 'event_cancelled', name: 'Event Cancelled', description: 'Triggers when event is cancelled/deleted', type: 'polling', sample: { summary: 'Team Meeting', cancelledAt: '2024-01-01' } },
              { id: 'event_started', name: 'Event Starting Soon', description: 'Triggers when event is about to start', type: 'polling', sample: { summary: 'Team Meeting', startsIn: '15 minutes', calendar: 'Work' } },
              { id: 'event_ended', name: 'Event Ended', description: 'Triggers when event ends', type: 'polling', sample: { summary: 'Team Meeting', endedAt: '2024-01-01T11:00:00Z' } },
              { id: 'new_attendee', name: 'Attendee Added', description: 'Triggers when attendee added to event', type: 'polling', sample: { summary: 'Team Meeting', attendee: 'jane@email.com', addedBy: 'john@email.com' } },
              { id: 'out_of_office', name: 'Out of Office', description: 'Triggers when out of office event created', type: 'polling', sample: { summary: 'Out of Office', start: '2024-01-15', end: '2024-01-20' } },
            ],
            actions: [
              { id: 'create_event', name: 'Create Event', description: 'Create a new calendar event', inputFields: [{ name: 'summary', type: 'string', required: true, label: 'Event Title' }, { name: 'start', type: 'string', required: true, label: 'Start (ISO format)' }, { name: 'end', type: 'string', required: true, label: 'End (ISO format)' }, { name: 'timezone', type: 'string', required: false, label: 'Timezone' }, { name: 'location', type: 'string', required: false, label: 'Location' }, { name: 'description', type: 'text', required: false, label: 'Description' }, { name: 'attendees', type: 'text', required: false, label: 'Attendees (comma-separated emails)' }, { name: 'calendarId', type: 'string', required: false, label: 'Calendar ID' }] },
              { id: 'update_event', name: 'Update Event', description: 'Update existing event', inputFields: [{ name: 'eventId', type: 'string', required: true, label: 'Event ID' }, { name: 'summary', type: 'string', required: false, label: 'Event Title' }, { name: 'start', type: 'string', required: false, label: 'Start (ISO format)' }, { name: 'end', type: 'string', required: false, label: 'End (ISO format)' }, { name: 'location', type: 'string', required: false, label: 'Location' }, { name: 'description', type: 'text', required: false, label: 'Description' }, { name: 'calendarId', type: 'string', required: false, label: 'Calendar ID' }] },
              { id: 'delete_event', name: 'Delete Event', description: 'Delete an event', inputFields: [{ name: 'eventId', type: 'string', required: true, label: 'Event ID' }, { name: 'calendarId', type: 'string', required: false, label: 'Calendar ID' }] },
              { id: 'quick_add_event', name: 'Quick Add Event', description: 'Create event from natural language', inputFields: [{ name: 'text', type: 'string', required: true, label: 'Text (e.g., "Dinner with John tomorrow 7pm")' }, { name: 'calendarId', type: 'string', required: false, label: 'Calendar ID' }] },
              { id: 'add_attendee', name: 'Add Attendee', description: 'Add attendee to event', inputFields: [{ name: 'eventId', type: 'string', required: true, label: 'Event ID' }, { name: 'email', type: 'string', required: true, label: 'Attendee Email' }, { name: 'sendUpdates', type: 'boolean', required: false, label: 'Send Update?' }] },
              { id: 'remove_attendee', name: 'Remove Attendee', description: 'Remove attendee from event', inputFields: [{ name: 'eventId', type: 'string', required: true, label: 'Event ID' }, { name: 'email', type: 'string', required: true, label: 'Attendee Email' }] },
              { id: 'get_events', name: 'Get Events', description: 'Retrieve events from calendar', inputFields: [{ name: 'calendarId', type: 'string', required: false, label: 'Calendar ID' }, { name: 'timeMin', type: 'string', required: false, label: 'Start Time (ISO)' }, { name: 'timeMax', type: 'string', required: false, label: 'End Time (ISO)' }, { name: 'maxResults', type: 'number', required: false, label: 'Max Results' }] },
              { id: 'create_all_day_event', name: 'Create All-Day Event', description: 'Create full-day event', inputFields: [{ name: 'summary', type: 'string', required: true, label: 'Event Title' }, { name: 'date', type: 'string', required: true, label: 'Date (YYYY-MM-DD)' }, { name: 'description', type: 'text', required: false, label: 'Description' }, { name: 'attendees', type: 'text', required: false, label: 'Attendees' }] },
              { id: 'create_recurring_event', name: 'Create Recurring Event', description: 'Create recurring event', inputFields: [{ name: 'summary', type: 'string', required: true, label: 'Event Title' }, { name: 'start', type: 'string', required: true, label: 'Start Time' }, { name: 'end', type: 'string', required: true, label: 'End Time' }, { name: 'recurrence', type: 'string', required: true, label: 'RRULE (e.g., FREQ=DAILY;COUNT=7)' }] },
            ]
          },
          {
            id: 'github', slug: 'github', name: 'GitHub', description: 'Code hosting and collaboration platform', icon: '🐙', category: 'Development', authType: 'oauth2',
            triggers: [
              { id: 'new_issue', name: 'New Issue', description: 'Triggers when new issue is created', type: 'webhook', sample: { title: 'Bug: Login fails', number: 42, author: 'john', labels: ['bug'] } },
              { id: 'issue_opened', name: 'Issue Opened', description: 'Triggers when issue is opened', type: 'webhook', sample: { title: 'Feature request', number: 43, body: 'Please add dark mode' } },
              { id: 'issue_closed', name: 'Issue Closed', description: 'Triggers when issue is closed', type: 'webhook', sample: { title: 'Bug fixed', number: 42, closedBy: 'admin' } },
              { id: 'issue_commented', name: 'Issue Commented', description: 'Triggers on new issue comment', type: 'webhook', sample: { issueNumber: 42, author: 'jane', comment: 'I can fix this' } },
              { id: 'new_pull_request', name: 'New Pull Request', description: 'Triggers when PR is created', type: 'webhook', sample: { title: 'Add feature X', number: 45, author: 'john', from: 'feature', to: 'main' } },
              { id: 'pr_merged', name: 'Pull Request Merged', description: 'Triggers when PR is merged', type: 'webhook', sample: { title: 'Add feature X', mergedBy: 'admin', mergeCommit: 'abc123' } },
              { id: 'pr_review', name: 'Pull Request Review', description: 'Triggers when PR receives review', type: 'webhook', sample: { title: 'PR #45', reviewer: 'jane', status: 'approved' } },
              { id: 'new_commit', name: 'New Commit/Push', description: 'Triggers on new commit or push', type: 'webhook', sample: { branch: 'main', commits: 3, author: 'john', message: 'Update README' } },
              { id: 'new_branch', name: 'New Branch', description: 'Triggers when new branch created', type: 'webhook', sample: { branch: 'feature/new-feature', createdBy: 'john' } },
              { id: 'branch_deleted', name: 'Branch Deleted', description: 'Triggers when branch is deleted', type: 'webhook', sample: { branch: 'feature/old', deletedBy: 'john' } },
              { id: 'new_release', name: 'New Release', description: 'Triggers when release is published', type: 'webhook', sample: { tag: 'v1.2.0', name: 'Version 1.2.0', author: 'admin' } },
              { id: 'workflow_completed', name: 'Workflow Completed', description: 'Triggers when GitHub Action completes', type: 'webhook', sample: { workflow: 'CI/CD', status: 'success', runId: '12345' } },
              { id: 'workflow_failed', name: 'Workflow Failed', description: 'Triggers when GitHub Action fails', type: 'webhook', sample: { workflow: 'CI/CD', status: 'failure', error: 'Test failed' } },
            ],
            actions: [
              { id: 'create_issue', name: 'Create Issue', description: 'Create a new issue', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository (owner/repo)' }, { name: 'title', type: 'string', required: true, label: 'Issue Title' }, { name: 'body', type: 'text', required: false, label: 'Description' }, { name: 'labels', type: 'text', required: false, label: 'Labels (comma-separated)' }, { name: 'assignees', type: 'text', required: false, label: 'Assignees (comma-separated)' }] },
              { id: 'update_issue', name: 'Update Issue', description: 'Update issue properties', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'issueNumber', type: 'number', required: true, label: 'Issue Number' }, { name: 'title', type: 'string', required: false, label: 'Title' }, { name: 'body', type: 'text', required: false, label: 'Body' }, { name: 'state', type: 'select', required: false, label: 'State', options: ['open', 'closed'] }, { name: 'labels', type: 'text', required: false, label: 'Labels' }] },
              { id: 'add_issue_comment', name: 'Add Issue Comment', description: 'Comment on an issue', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'issueNumber', type: 'number', required: true, label: 'Issue Number' }, { name: 'body', type: 'text', required: true, label: 'Comment' }] },
              { id: 'create_pull_request', name: 'Create Pull Request', description: 'Create a new PR', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'title', type: 'string', required: true, label: 'PR Title' }, { name: 'body', type: 'text', required: false, label: 'Description' }, { name: 'head', type: 'string', required: true, label: 'Source Branch' }, { name: 'base', type: 'string', required: true, label: 'Target Branch' }, { name: 'draft', type: 'boolean', required: false, label: 'Draft PR?' }] },
              { id: 'merge_pull_request', name: 'Merge Pull Request', description: 'Merge a PR', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'prNumber', type: 'number', required: true, label: 'PR Number' }, { name: 'commitTitle', type: 'string', required: false, label: 'Commit Title' }, { name: 'method', type: 'select', required: false, label: 'Merge Method', options: ['merge', 'squash', 'rebase'] }] },
              { id: 'add_labels', name: 'Add Labels to Issue/PR', description: 'Add labels to issue or PR', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'issueNumber', type: 'number', required: true, label: 'Issue/PR Number' }, { name: 'labels', type: 'text', required: true, label: 'Labels (comma-separated)' }] },
              { id: 'remove_labels', name: 'Remove Labels', description: 'Remove labels from issue/PR', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'issueNumber', type: 'number', required: true, label: 'Issue/PR Number' }, { name: 'labels', type: 'text', required: true, label: 'Labels (comma-separated)' }] },
              { id: 'assign_issue', name: 'Assign Issue', description: 'Assign issue to user', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'issueNumber', type: 'number', required: true, label: 'Issue Number' }, { name: 'assignees', type: 'text', required: true, label: 'Assignees (comma-separated usernames)' }] },
              { id: 'create_branch', name: 'Create Branch', description: 'Create a new branch', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'name', type: 'string', required: true, label: 'Branch Name' }, { name: 'fromBranch', type: 'string', required: true, label: 'From Branch' }] },
              { id: 'create_repository', name: 'Create Repository', description: 'Create a new repo (under authenticated user)', inputFields: [{ name: 'name', type: 'string', required: true, label: 'Repository Name' }, { name: 'description', type: 'text', required: false, label: 'Description' }, { name: 'private', type: 'boolean', required: false, label: 'Private?' }, { name: 'autoInit', type: 'boolean', required: false, label: 'Initialize with README?' }] },
              { id: 'fork_repository', name: 'Fork Repository', description: 'Fork an existing repository', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository (owner/repo)' }] },
              { id: 'get_issue', name: 'Get Issue Details', description: 'Retrieve issue information', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'issueNumber', type: 'number', required: true, label: 'Issue Number' }] },
              { id: 'list_commits', name: 'List Commits', description: 'Get recent commits', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'branch', type: 'string', required: false, label: 'Branch' }, { name: 'limit', type: 'number', required: false, label: 'Max Results' }] },
              { id: 'create_file', name: 'Create/Update File', description: 'Create or update file in repo', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'path', type: 'string', required: true, label: 'File Path' }, { name: 'content', type: 'text', required: true, label: 'Content (base64 for binary)' }, { name: 'message', type: 'string', required: true, label: 'Commit Message' }, { name: 'branch', type: 'string', required: false, label: 'Branch' }] },
              { id: 'get_file', name: 'Get File Contents', description: 'Get file from repository', inputFields: [{ name: 'repo', type: 'string', required: true, label: 'Repository' }, { name: 'path', type: 'string', required: true, label: 'File Path' }, { name: 'branch', type: 'string', required: false, label: 'Branch' }] },
            ]
          },
          {
            id: 'schedule', slug: 'schedule', name: 'Schedule', description: 'Trigger workflows on a schedule', icon: '⏰', category: 'Utility', authType: 'none',
            triggers: [
              { id: 'every_minute', name: 'Every Minute', description: 'Runs every minute', type: 'schedule', schedule: '* * * * *', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'every_5_minutes', name: 'Every 5 Minutes', description: 'Runs every 5 minutes', type: 'schedule', schedule: '*/5 * * * *', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'every_15_minutes', name: 'Every 15 Minutes', description: 'Runs every 15 minutes', type: 'schedule', schedule: '*/15 * * * *', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'every_30_minutes', name: 'Every 30 Minutes', description: 'Runs every 30 minutes', type: 'schedule', schedule: '*/30 * * * *', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'every_hour', name: 'Every Hour', description: 'Runs every hour', type: 'schedule', schedule: '0 * * * *', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'every_day', name: 'Every Day', description: 'Runs once per day at midnight', type: 'schedule', schedule: '0 0 * * *', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'every_week', name: 'Every Week', description: 'Runs once per week on Monday', type: 'schedule', schedule: '0 0 * * 1', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'every_month', name: 'Every Month', description: 'Runs first day of each month', type: 'schedule', schedule: '0 0 1 * *', sample: { timestamp: '2024-01-01T00:00:00Z' } },
              { id: 'custom_cron', name: 'Custom Schedule (Cron)', description: 'Runs on custom cron schedule', type: 'schedule', schedule: '0 9 * * 1-5', sample: { timestamp: '2024-01-01T09:00:00Z', cron: '0 9 * * 1-5' } },
              { id: 'every_weekday', name: 'Every Weekday', description: 'Runs Monday-Friday at 9am', type: 'schedule', schedule: '0 9 * * 1-5', sample: { timestamp: '2024-01-01T09:00:00Z' } },
            ],
            actions: []
          },
          {
            id: 'webhook', slug: 'webhook', name: 'Webhook', description: 'Trigger workflows via HTTP request', icon: '🪝', category: 'Utility', authType: 'none',
            triggers: [
              { id: 'incoming_webhook', name: 'Catch Hook', description: 'Receive data from any service via webhook', type: 'webhook', sample: { data: 'Received payload', headers: {}, query: {} } },
              { id: 'incoming_webhook_json', name: 'Catch Hook (JSON)', description: 'Receive JSON data from webhook', type: 'webhook', sample: { json: { key: 'value' }, source: 'external' } },
              { id: 'incoming_webhook_form', name: 'Catch Form Data', description: 'Receive form-encoded data', type: 'webhook', sample: { formData: { field1: 'value1' } } },
            ],
            actions: [
              { id: 'send_webhook', name: 'Send Outgoing Webhook', description: 'Send data to external URL', inputFields: [{ name: 'url', type: 'string', required: true, label: 'Webhook URL' }, { name: 'method', type: 'select', required: true, label: 'Method', options: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'] }, { name: 'headers', type: 'text', required: false, label: 'Headers (JSON)' }, { name: 'body', type: 'text', required: false, label: 'Body' }, { name: 'authType', type: 'select', required: false, label: 'Auth Type', options: ['none', 'basic', 'bearer', 'apiKey'] }, { name: 'authValue', type: 'string', required: false, label: 'Auth Value' }] },
              { id: 'send_json_webhook', name: 'Send JSON Webhook', description: 'Send JSON data to webhook', inputFields: [{ name: 'url', type: 'string', required: true, label: 'Webhook URL' }, { name: 'jsonBody', type: 'text', required: true, label: 'JSON Body' }, { name: 'headers', type: 'text', required: false, label: 'Headers (JSON)' }] },
            ]
          },
          {
            id: 'discord', slug: 'discord', name: 'Discord', description: 'Chat and community platform', icon: '🎮', category: 'Communication', authType: 'webhook',
            triggers: [
              { id: 'new_message', name: 'New Message', description: 'Triggers when message in channel', type: 'webhook', sample: { content: 'Hello', author: 'user#1234', channel: 'general' } },
              { id: 'message_contains', name: 'Message Contains', description: 'Triggers when message contains keyword', type: 'webhook', sample: { content: '!help', author: 'user', matched: '!help' } },
            ],
            actions: [
              { id: 'send_message', name: 'Send Message', description: 'Send message to channel', inputFields: [{ name: 'webhookUrl', type: 'string', required: true, label: 'Webhook URL' }, { name: 'content', type: 'text', required: true, label: 'Message' }, { name: 'username', type: 'string', required: false, label: 'Override Username' }, { name: 'avatarUrl', type: 'string', required: false, label: 'Avatar URL' }, { name: 'embeds', type: 'text', required: false, label: 'Embeds (JSON Array)' }] },
              { id: 'send_embed', name: 'Send Rich Embed', description: 'Send formatted embed', inputFields: [{ name: 'webhookUrl', type: 'string', required: true, label: 'Webhook URL' }, { name: 'title', type: 'string', required: false, label: 'Title' }, { name: 'description', type: 'text', required: false, label: 'Description' }, { name: 'color', type: 'string', required: false, label: 'Color (hex)' }, { name: 'url', type: 'string', required: false, label: 'URL' }, { name: 'thumbnail', type: 'string', required: false, label: 'Thumbnail URL' }, { name: 'authorName', type: 'string', required: false, label: 'Author Name' }] },
            ]
          },
          {
            id: 'trello', slug: 'trello', name: 'Trello', description: 'Project management and boards', icon: '📋', category: 'Productivity', authType: 'oauth2',
            triggers: [
              { id: 'new_card', name: 'New Card Added', description: 'Triggers when card added to list', type: 'polling', sample: { name: 'Task 1', list: 'To Do', board: 'Project', member: 'john' } },
              { id: 'card_updated', name: 'Card Updated', description: 'Triggers when card is updated', type: 'polling', sample: { name: 'Task 1', changes: ['description'], updatedBy: 'jane' } },
              { id: 'card_moved', name: 'Card Moved', description: 'Triggers when card moves to another list', type: 'polling', sample: { name: 'Task 1', from: 'To Do', to: 'Done', board: 'Project' } },
              { id: 'card_archived', name: 'Card Archived', description: 'Triggers when card is archived', type: 'polling', sample: { name: 'Old Task', archived: true } },
              { id: 'new_comment', name: 'New Comment', description: 'Triggers when comment added to card', type: 'polling', sample: { card: 'Task 1', comment: 'Great work!', author: 'jane' } },
              { id: 'new_attachment', name: 'New Attachment', description: 'Triggers when attachment added', type: 'polling', sample: { card: 'Task 1', attachment: 'file.pdf', addedBy: 'john' } },
              { id: 'new_label', name: 'Label Added', description: 'Triggers when label added to card', type: 'polling', sample: { card: 'Task 1', label: 'Bug', addedBy: 'john' } },
              { id: 'due_date_set', name: 'Due Date Set', description: 'Triggers when due date is set', type: 'polling', sample: { card: 'Task 1', dueDate: '2024-01-15' } },
            ],
            actions: [
              { id: 'create_card', name: 'Create Card', description: 'Create new card on list', inputFields: [{ name: 'listId', type: 'string', required: true, label: 'List ID' }, { name: 'name', type: 'string', required: true, label: 'Card Name' }, { name: 'desc', type: 'text', required: false, label: 'Description' }, { name: 'pos', type: 'select', required: false, label: 'Position', options: ['top', 'bottom'] }, { name: 'due', type: 'string', required: false, label: 'Due Date (ISO)' }, { name: 'labels', type: 'text', required: false, label: 'Labels (comma-separated)' }, { name: 'memberIds', type: 'text', required: false, label: 'Member IDs (comma-separated)' }] },
              { id: 'update_card', name: 'Update Card', description: 'Update card properties', inputFields: [{ name: 'cardId', type: 'string', required: true, label: 'Card ID' }, { name: 'name', type: 'string', required: false, label: 'Name' }, { name: 'desc', type: 'text', required: false, label: 'Description' }, { name: 'closed', type: 'boolean', required: false, label: 'Archived?' }] },
              { id: 'move_card', name: 'Move Card', description: 'Move card to another list', inputFields: [{ name: 'cardId', type: 'string', required: true, label: 'Card ID' }, { name: 'listId', type: 'string', required: true, label: 'Target List ID' }, { name: 'pos', type: 'string', required: false, label: 'Position' }] },
              { id: 'archive_card', name: 'Archive Card', description: 'Archive a card', inputFields: [{ name: 'cardId', type: 'string', required: true, label: 'Card ID' }] },
              { id: 'delete_card', name: 'Delete Card', description: 'Permanently delete card', inputFields: [{ name: 'cardId', type: 'string', required: true, label: 'Card ID' }] },
              { id: 'add_comment', name: 'Add Comment', description: 'Comment on card', inputFields: [{ name: 'cardId', type: 'string', required: true, label: 'Card ID' }, { name: 'text', type: 'text', required: true, label: 'Comment' }] },
              { id: 'add_label', name: 'Add Label', description: 'Add label to card', inputFields: [{ name: 'cardId', type: 'string', required: true, label: 'Card ID' }, { name: 'labelName', type: 'string', required: true, label: 'Label Name' }, { name: 'color', type: 'string', required: false, label: 'Color (optional)' }] },
              { id: 'remove_label', name: 'Remove Label', description: 'Remove label from card', inputFields: [{ name: 'cardId', type: 'string', required: true, label: 'Card ID' }, { name: 'labelName', type: 'string', required: true, label: 'Label Name' }] },
              { id: 'add_member', name: 'Add Member', description: 'Assign member to card', inputFields: [{ name: 'cardId', type: 'string', required: true, label: 'Card ID' }, { name: 'memberId', type: 'string', required: true, label: 'Member ID' }] },
              { id: 'remove_member', name: 'Remove Member', description: 'Unassign member from card', inputFields: [{ name: 'cardId', type: 'string', required: true, label: 'Card ID' }, { name: 'memberId', type: 'string', required: true, label: 'Member ID' }] },
              { id: 'create_list', name: 'Create List', description: 'Create new list on board', inputFields: [{ name: 'boardId', type: 'string', required: true, label: 'Board ID' }, { name: 'name', type: 'string', required: true, label: 'List Name' }, { name: 'pos', type: 'string', required: false, label: 'Position' }] },
              { id: 'create_board', name: 'Create Board', description: 'Create new board', inputFields: [{ name: 'name', type: 'string', required: true, label: 'Board Name' }, { name: 'desc', type: 'text', required: false, label: 'Description' }, { name: 'visibility', type: 'select', required: false, label: 'Visibility', options: ['private', 'org', 'public'] }] },
              { id: 'get_board', name: 'Get Board', description: 'Get board details', inputFields: [{ name: 'boardId', type: 'string', required: true, label: 'Board ID' }] },
              { id: 'get_cards', name: 'Get Cards from List', description: 'Get all cards from a list', inputFields: [{ name: 'listId', type: 'string', required: true, label: 'List ID' }] },
            ]
          },
          {
            id: 'twitter', slug: 'twitter', name: 'Twitter/X', description: 'Social media platform', icon: '🐦', category: 'Social', authType: 'oauth2',
            triggers: [
              { id: 'new_tweet', name: 'New Tweet by You', description: 'Triggers when you post new tweet', type: 'polling', sample: { text: 'Hello world!', tweetId: '123', createdAt: '2024-01-01' } },
              { id: 'new_mention', name: 'New Mention', description: 'Triggers when someone mentions you', type: 'polling', sample: { from: '@user', text: '@me check this out', tweetId: '456' } },
              { id: 'new_follower', name: 'New Follower', description: 'Triggers when someone follows you', type: 'polling', sample: { follower: '@newuser', followerCount: 150 } },
              { id: 'new_retweet', name: 'Tweet Retweeted', description: 'Triggers when your tweet is retweeted', type: 'polling', sample: { tweetId: '123', retweetedBy: '@fan', retweetCount: 10 } },
              { id: 'new_like', name: 'Tweet Liked', description: 'Triggers when someone likes your tweet', type: 'polling', sample: { tweetId: '123', likedBy: '@user', likeCount: 5 } },
              { id: 'new_dm', name: 'New Direct Message', description: 'Triggers when you receive DM', type: 'polling', sample: { from: '@user', text: 'Hi!', dmId: '789' } },
              { id: 'tweet_matching', name: 'Tweet Matching Search', description: 'Triggers on tweet matching search', type: 'polling', sample: { query: '#tech', text: 'Great news!', author: '@technews' } },
            ],
            actions: [
              { id: 'post_tweet', name: 'Post Tweet', description: 'Create a new tweet', inputFields: [{ name: 'text', type: 'text', required: true, label: 'Tweet Text (max 280)' }, { name: 'mediaUrls', type: 'text', required: false, label: 'Media URLs (comma-separated)' }, { name: 'replyTo', type: 'string', required: false, label: 'Reply to Tweet ID' }] },
              { id: 'reply_to_tweet', name: 'Reply to Tweet', description: 'Reply to existing tweet', inputFields: [{ name: 'tweetId', type: 'string', required: true, label: 'Tweet ID' }, { name: 'text', type: 'text', required: true, label: 'Reply Text' }] },
              { id: 'retweet', name: 'Retweet', description: 'Retweet a tweet', inputFields: [{ name: 'tweetId', type: 'string', required: true, label: 'Tweet ID' }] },
              { id: 'like_tweet', name: 'Like Tweet', description: 'Like a tweet', inputFields: [{ name: 'tweetId', type: 'string', required: true, label: 'Tweet ID' }] },
              { id: 'unlike_tweet', name: 'Unlike Tweet', description: 'Unlike a tweet', inputFields: [{ name: 'tweetId', type: 'string', required: true, label: 'Tweet ID' }] },
              { id: 'delete_tweet', name: 'Delete Tweet', description: 'Delete your tweet', inputFields: [{ name: 'tweetId', type: 'string', required: true, label: 'Tweet ID' }] },
              { id: 'send_dm', name: 'Send DM', description: 'Send direct message', inputFields: [{ name: 'userId', type: 'string', required: true, label: 'User ID or @handle' }, { name: 'text', type: 'text', required: true, label: 'Message' }] },
              { id: 'follow_user', name: 'Follow User', description: 'Follow a user', inputFields: [{ name: 'userId', type: 'string', required: true, label: 'User ID or @handle' }] },
              { id: 'unfollow_user', name: 'Unfollow User', description: 'Unfollow a user', inputFields: [{ name: 'userId', type: 'string', required: true, label: 'User ID or @handle' }] },
              { id: 'search_tweets', name: 'Search Tweets', description: 'Search recent tweets', inputFields: [{ name: 'query', type: 'string', required: true, label: 'Search Query' }, { name: 'limit', type: 'number', required: false, label: 'Max Results' }] },
              { id: 'get_user_tweets', name: 'Get User Tweets', description: 'Get tweets from user', inputFields: [{ name: 'userId', type: 'string', required: true, label: 'User ID or @handle' }, { name: 'limit', type: 'number', required: false, label: 'Max Results' }] },
            ]
          },
          {
            id: 'stripe', slug: 'stripe', name: 'Stripe', description: 'Payment processing platform', icon: '💳', category: 'Payment', authType: 'api_key',
            triggers: [
              { id: 'new_payment', name: 'New Payment', description: 'Triggers when payment is successful', type: 'webhook', sample: { amount: 999, currency: 'usd', customer: 'cus_123', status: 'succeeded' } },
              { id: 'payment_failed', name: 'Payment Failed', description: 'Triggers when payment fails', type: 'webhook', sample: { amount: 999, customer: 'cus_123', failureMessage: 'Card declined' } },
              { id: 'new_subscription', name: 'New Subscription', description: 'Triggers when subscription created', type: 'webhook', sample: { customer: 'cus_123', plan: 'pro', status: 'active' } },
              { id: 'subscription_cancelled', name: 'Subscription Cancelled', description: 'Triggers when subscription cancelled', type: 'webhook', sample: { customer: 'cus_123', plan: 'pro', cancelAtPeriodEnd: true } },
              { id: 'subscription_updated', name: 'Subscription Updated', description: 'Triggers when subscription changes', type: 'webhook', sample: { customer: 'cus_123', oldPlan: 'basic', newPlan: 'pro' } },
              { id: 'new_customer', name: 'New Customer', description: 'Triggers when new customer created', type: 'webhook', sample: { email: 'customer@email.com', name: 'John Doe' } },
              { id: 'new_refund', name: 'New Refund', description: 'Triggers when refund is issued', type: 'webhook', sample: { amount: 500, paymentIntent: 'pi_123', reason: 'requested_by_customer' } },
              { id: 'invoice_created', name: 'Invoice Created', description: 'Triggers when invoice is created', type: 'webhook', sample: { customer: 'cus_123', amountDue: 999, dueDate: '2024-01-15' } },
              { id: 'invoice_paid', name: 'Invoice Paid', description: 'Triggers when invoice is paid', type: 'webhook', sample: { customer: 'cus_123', amountPaid: 999 } },
            ],
            actions: [
              { id: 'create_customer', name: 'Create Customer', description: 'Create new customer', inputFields: [{ name: 'email', type: 'string', required: true, label: 'Email' }, { name: 'name', type: 'string', required: false, label: 'Name' }, { name: 'phone', type: 'string', required: false, label: 'Phone' }, { name: 'metadata', type: 'object', required: false, label: 'Metadata (JSON)' }] },
              { id: 'update_customer', name: 'Update Customer', description: 'Update customer details', inputFields: [{ name: 'customerId', type: 'string', required: true, label: 'Customer ID' }, { name: 'email', type: 'string', required: false, label: 'Email' }, { name: 'name', type: 'string', required: false, label: 'Name' }, { name: 'metadata', type: 'object', required: false, label: 'Metadata' }] },
              { id: 'create_payment_intent', name: 'Create Payment Intent', description: 'Create payment for checkout', inputFields: [{ name: 'amount', type: 'number', required: true, label: 'Amount (cents)' }, { name: 'currency', type: 'string', required: true, label: 'Currency (e.g., usd)' }, { name: 'customer', type: 'string', required: false, label: 'Customer ID' }, { name: 'description', type: 'string', required: false, label: 'Description' }, { name: 'metadata', type: 'object', required: false, label: 'Metadata' }] },
              { id: 'create_subscription', name: 'Create Subscription', description: 'Subscribe customer to plan', inputFields: [{ name: 'customer', type: 'string', required: true, label: 'Customer ID' }, { name: 'price', type: 'string', required: true, label: 'Price ID' }, { name: 'trialPeriodDays', type: 'number', required: false, label: 'Trial Period Days' }] },
              { id: 'cancel_subscription', name: 'Cancel Subscription', description: 'Cancel subscription', inputFields: [{ name: 'subscriptionId', type: 'string', required: true, label: 'Subscription ID' }, { name: 'cancelAtPeriodEnd', type: 'boolean', required: false, label: 'Cancel at period end?' }] },
              { id: 'create_invoice', name: 'Create Invoice', description: 'Create invoice for customer', inputFields: [{ name: 'customer', type: 'string', required: true, label: 'Customer ID' }, { name: 'description', type: 'string', required: false, label: 'Description' }, { name: 'dueDate', type: 'number', required: false, label: 'Due Date (timestamp)' }] },
              { id: 'send_invoice', name: 'Send Invoice', description: 'Send invoice to customer', inputFields: [{ name: 'invoiceId', type: 'string', required: true, label: 'Invoice ID' }] },
              { id: 'create_refund', name: 'Create Refund', description: 'Issue full or partial refund', inputFields: [{ name: 'paymentIntent', type: 'string', required: true, label: 'Payment Intent ID' }, { name: 'amount', type: 'number', required: false, label: 'Amount (omit for full refund)' }, { name: 'reason', type: 'select', required: false, label: 'Reason', options: ['duplicate', 'fraudulent', 'requested_by_customer'] }] },
              { id: 'get_customer', name: 'Get Customer', description: 'Retrieve customer details', inputFields: [{ name: 'customerId', type: 'string', required: true, label: 'Customer ID' }] },
              { id: 'list_payments', name: 'List Payments', description: 'List recent payments', inputFields: [{ name: 'customer', type: 'string', required: false, label: 'Customer ID' }, { name: 'limit', type: 'number', required: false, label: 'Max Results' }] },
            ]
          },
          {
            id: 'airtable', slug: 'airtable', name: 'Airtable', description: 'Cloud-based spreadsheet and database', icon: '🗃️', category: 'Database', authType: 'oauth2',
            triggers: [
              { id: 'new_record', name: 'New Record', description: 'Triggers when a new record is created', type: 'polling', sample: { recordId: 'rec123', fields: { Name: 'John Doe', Status: 'New' }, createdAt: '2024-01-01' } },
              { id: 'record_updated', name: 'Record Updated', description: 'Triggers when a record is modified', type: 'polling', sample: { recordId: 'rec123', fields: { Name: 'John Doe', Status: 'In Progress' }, updatedAt: '2024-01-01', changes: ['Status'] } },
              { id: 'new_field', name: 'New Field Added', description: 'Triggers when a new field is added to table', type: 'polling', sample: { tableId: 'tbl123', field: 'Priority', type: 'singleSelect' } },
              { id: 'record_deleted', name: 'Record Deleted', description: 'Triggers when a record is deleted', type: 'polling', sample: { recordId: 'rec123', tableId: 'tbl123' } },
            ],
            actions: [
              { id: 'create_record', name: 'Create Record', description: 'Create a new record', inputFields: [{ name: 'baseId', type: 'string', required: true, label: 'Base ID' }, { name: 'tableId', type: 'string', required: true, label: 'Table ID' }, { name: 'fields', type: 'object', required: true, label: 'Fields (JSON)' }] },
              { id: 'update_record', name: 'Update Record', description: 'Update existing record', inputFields: [{ name: 'baseId', type: 'string', required: true, label: 'Base ID' }, { name: 'tableId', type: 'string', required: true, label: 'Table ID' }, { name: 'recordId', type: 'string', required: true, label: 'Record ID' }, { name: 'fields', type: 'object', required: true, label: 'Fields (JSON)' }] },
              { id: 'find_record', name: 'Find Record', description: 'Find record by field value', inputFields: [{ name: 'baseId', type: 'string', required: true, label: 'Base ID' }, { name: 'tableId', type: 'string', required: true, label: 'Table ID' }, { name: 'field', type: 'string', required: true, label: 'Field Name' }, { name: 'value', type: 'string', required: true, label: 'Search Value' }] },
              { id: 'delete_record', name: 'Delete Record', description: 'Delete a record', inputFields: [{ name: 'baseId', type: 'string', required: true, label: 'Base ID' }, { name: 'tableId', type: 'string', required: true, label: 'Table ID' }, { name: 'recordId', type: 'string', required: true, label: 'Record ID' }] },
              { id: 'get_record', name: 'Get Record', description: 'Get record by ID', inputFields: [{ name: 'baseId', type: 'string', required: true, label: 'Base ID' }, { name: 'tableId', type: 'string', required: true, label: 'Table ID' }, { name: 'recordId', type: 'string', required: true, label: 'Record ID' }] },
              { id: 'list_records', name: 'List Records', description: 'List records from table', inputFields: [{ name: 'baseId', type: 'string', required: true, label: 'Base ID' }, { name: 'tableId', type: 'string', required: true, label: 'Table ID' }, { name: 'filter', type: 'text', required: false, label: 'Filter Formula' }, { name: 'maxRecords', type: 'number', required: false, label: 'Max Records' }] },
            ]
          },
          {
            id: 'jira', slug: 'jira', name: 'Jira', description: 'Project and issue tracking', icon: '📋', category: 'Development', authType: 'oauth2',
            triggers: [
              { id: 'new_issue', name: 'New Issue Created', description: 'Triggers when a new issue is created', type: 'webhook', sample: { issueKey: 'PROJ-123', summary: 'Bug in login page', type: 'bug', priority: 'high', reporter: 'john@email.com' } },
              { id: 'issue_transitioned', name: 'Issue Status Changed', description: 'Triggers when issue moves to different status', type: 'webhook', sample: { issueKey: 'PROJ-123', fromStatus: 'To Do', toStatus: 'In Progress', assignee: 'jane@email.com' } },
              { id: 'comment_added', name: 'Comment Added', description: 'Triggers when comment is added to issue', type: 'webhook', sample: { issueKey: 'PROJ-123', comment: 'Fixed in latest commit', author: 'john@email.com' } },
              { id: 'issue_assigned', name: 'Issue Assigned', description: 'Triggers when issue is assigned', type: 'webhook', sample: { issueKey: 'PROJ-123', assignee: 'jane@email.com', previousAssignee: 'john@email.com' } },
              { id: 'sprint_started', name: 'Sprint Started', description: 'Triggers when a sprint begins', type: 'webhook', sample: { sprintName: 'Sprint 5', startDate: '2024-01-01', endDate: '2024-01-14' } },
            ],
            actions: [
              { id: 'create_issue', name: 'Create Issue', description: 'Create a new issue', inputFields: [{ name: 'projectKey', type: 'string', required: true, label: 'Project Key' }, { name: 'summary', type: 'string', required: true, label: 'Summary' }, { name: 'description', type: 'text', required: false, label: 'Description' }, { name: 'issueType', type: 'select', required: true, label: 'Issue Type', options: ['bug', 'task', 'story', 'epic'] }, { name: 'priority', type: 'select', required: false, label: 'Priority', options: ['highest', 'high', 'medium', 'low', 'lowest'] }] },
              { id: 'update_issue', name: 'Update Issue', description: 'Update issue fields', inputFields: [{ name: 'issueKey', type: 'string', required: true, label: 'Issue Key' }, { name: 'summary', type: 'string', required: false, label: 'Summary' }, { name: 'description', type: 'text', required: false, label: 'Description' }, { name: 'priority', type: 'select', required: false, label: 'Priority', options: ['highest', 'high', 'medium', 'low', 'lowest'] }] },
              { id: 'add_comment', name: 'Add Comment', description: 'Add comment to issue', inputFields: [{ name: 'issueKey', type: 'string', required: true, label: 'Issue Key' }, { name: 'comment', type: 'text', required: true, label: 'Comment' }] },
              { id: 'transition_issue', name: 'Transition Issue', description: 'Move issue to new status', inputFields: [{ name: 'issueKey', type: 'string', required: true, label: 'Issue Key' }, { name: 'status', type: 'select', required: true, label: 'Status', options: ['To Do', 'In Progress', 'In Review', 'Done'] }] },
              { id: 'assign_issue', name: 'Assign Issue', description: 'Assign issue to user', inputFields: [{ name: 'issueKey', type: 'string', required: true, label: 'Issue Key' }, { name: 'assignee', type: 'string', required: true, label: 'Assignee (email)' }] },
              { id: 'link_issues', name: 'Link Issues', description: 'Link two issues', inputFields: [{ name: 'issueKey', type: 'string', required: true, label: 'Issue Key' }, { name: 'linkedIssueKey', type: 'string', required: true, label: 'Linked Issue Key' }, { name: 'linkType', type: 'select', required: true, label: 'Link Type', options: ['blocks', 'is blocked by', 'duplicates', 'is duplicated by', 'relates to'] }] },
              { id: 'add_attachment', name: 'Add Attachment', description: 'Attach file to issue', inputFields: [{ name: 'issueKey', type: 'string', required: true, label: 'Issue Key' }, { name: 'fileUrl', type: 'string', required: true, label: 'File URL' }, { name: 'fileName', type: 'string', required: false, label: 'File Name' }] },
            ]
          },
          {
            id: 'google_drive', slug: 'google-drive', name: 'Google Drive', description: 'Cloud file storage and synchronization', icon: '📁', category: 'Files', authType: 'oauth2',
            triggers: [
              { id: 'new_file', name: 'New File', description: 'Triggers when new file is created', type: 'polling', sample: { fileId: 'abc123', name: 'Report.pdf', mimeType: 'application/pdf', size: 102400, createdAt: '2024-01-01' } },
              { id: 'file_updated', name: 'File Updated', description: 'Triggers when file is modified', type: 'polling', sample: { fileId: 'abc123', name: 'Report.pdf', modifiedAt: '2024-01-01', modifiedBy: 'john@email.com' } },
              { id: 'new_folder', name: 'New Folder', description: 'Triggers when new folder is created', type: 'polling', sample: { folderId: 'folder123', name: 'Project Files', createdAt: '2024-01-01' } },
              { id: 'file_shared', name: 'File Shared', description: 'Triggers when file is shared', type: 'polling', sample: { fileId: 'abc123', sharedWith: 'jane@email.com', permission: 'reader' } },
            ],
            actions: [
              { id: 'upload_file', name: 'Upload File', description: 'Upload file to Drive', inputFields: [{ name: 'folderId', type: 'string', required: false, label: 'Folder ID' }, { name: 'fileName', type: 'string', required: true, label: 'File Name' }, { name: 'content', type: 'text', required: true, label: 'Content (base64)' }, { name: 'mimeType', type: 'string', required: false, label: 'Mime Type' }] },
              { id: 'create_folder', name: 'Create Folder', description: 'Create new folder', inputFields: [{ name: 'name', type: 'string', required: true, label: 'Folder Name' }, { name: 'parentId', type: 'string', required: false, label: 'Parent Folder ID' }] },
              { id: 'share_file', name: 'Share File', description: 'Share file with someone', inputFields: [{ name: 'fileId', type: 'string', required: true, label: 'File ID' }, { name: 'email', type: 'string', required: true, label: 'Email Address' }, { name: 'role', type: 'select', required: true, label: 'Role', options: ['reader', 'writer', 'commenter'] }, { name: 'type', type: 'select', required: false, label: 'Share Type', options: ['user', 'group', 'domain'] }] },
              { id: 'move_file', name: 'Move File', description: 'Move file to folder', inputFields: [{ name: 'fileId', type: 'string', required: true, label: 'File ID' }, { name: 'folderId', type: 'string', required: true, label: 'Destination Folder ID' }] },
              { id: 'copy_file', name: 'Copy File', description: 'Copy file', inputFields: [{ name: 'fileId', type: 'string', required: true, label: 'File ID' }, { name: 'name', type: 'string', required: true, label: 'New File Name' }, { name: 'folderId', type: 'string', required: false, label: 'Destination Folder ID' }] },
              { id: 'delete_file', name: 'Delete File', description: 'Move file to trash', inputFields: [{ name: 'fileId', type: 'string', required: true, label: 'File ID' }] },
              { id: 'list_files', name: 'List Files', description: 'List files in folder', inputFields: [{ name: 'folderId', type: 'string', required: false, label: 'Folder ID (root if empty)' }, { name: 'mimeType', type: 'string', required: false, label: 'Filter by Mime Type' }, { name: 'maxResults', type: 'number', required: false, label: 'Max Results' }] },
              { id: 'get_file', name: 'Get File', description: 'Get file metadata', inputFields: [{ name: 'fileId', type: 'string', required: true, label: 'File ID' }] },
            ]
          },
          {
            id: 'dropbox', slug: 'dropbox', name: 'Dropbox', description: 'Cloud storage and file sharing', icon: '📦', category: 'Files', authType: 'oauth2',
            triggers: [
              { id: 'new_file', name: 'New File', description: 'Triggers when file is uploaded', type: 'polling', sample: { fileId: 'id123', name: 'document.pdf', path: '/Documents/', size: 512000, modifiedAt: '2024-01-01' } },
              { id: 'file_shared', name: 'File Shared', description: 'Triggers when file is shared', type: 'polling', sample: { fileId: 'id123', sharedLink: 'https://dropbox.link/abc', sharedAt: '2024-01-01' } },
              { id: 'folder_deleted', name: 'Folder Deleted', description: 'Triggers when folder is deleted', type: 'polling', sample: { folderId: 'folder123', path: '/Archive/' } },
            ],
            actions: [
              { id: 'upload_file', name: 'Upload File', description: 'Upload file to Dropbox', inputFields: [{ name: 'path', type: 'string', required: true, label: 'Path (e.g., /folder/file.txt)' }, { name: 'content', type: 'text', required: true, label: 'Content (base64)' }, { name: 'mode', type: 'select', required: false, label: 'Mode', options: ['add', 'overwrite', 'update'] }] },
              { id: 'create_folder', name: 'Create Folder', description: 'Create new folder', inputFields: [{ name: 'path', type: 'string', required: true, label: 'Path' }, { name: 'autorename', type: 'boolean', required: false, label: 'Auto Rename if exists?' }] },
              { id: 'share_file', name: 'Create Shared Link', description: 'Create shared link for file', inputFields: [{ name: 'path', type: 'string', required: true, label: 'Path' }, { name: 'visibility', type: 'select', required: false, label: 'Visibility', options: ['public', 'team_only', 'password'] }] },
              { id: 'move_file', name: 'Move File', description: 'Move file to new location', inputFields: [{ name: 'fromPath', type: 'string', required: true, label: 'From Path' }, { name: 'toPath', type: 'string', required: true, label: 'To Path' }] },
              { id: 'copy_file', name: 'Copy File', description: 'Copy file', inputFields: [{ name: 'fromPath', type: 'string', required: true, label: 'From Path' }, { name: 'toPath', type: 'string', required: true, label: 'To Path' }] },
              { id: 'delete_file', name: 'Delete File', description: 'Delete file', inputFields: [{ name: 'path', type: 'string', required: true, label: 'Path' }] },
              { id: 'list_files', name: 'List Files', description: 'List files in folder', inputFields: [{ name: 'path', type: 'string', required: false, label: 'Path (root if empty)' }, { name: 'maxResults', type: 'number', required: false, label: 'Max Results' }] },
              { id: 'get_file', name: 'Get File Metadata', description: 'Get file info', inputFields: [{ name: 'path', type: 'string', required: true, label: 'Path' }] },
              { id: 'download_file', name: 'Download File', description: 'Download file content', inputFields: [{ name: 'path', type: 'string', required: true, label: 'Path' }] },
            ]
          },
          {
            id: 'shopify', slug: 'shopify', name: 'Shopify', description: 'E-commerce platform', icon: '🛒', category: 'E-commerce', authType: 'oauth2',
            triggers: [
              { id: 'new_order', name: 'New Order', description: 'Triggers when new order is created', type: 'webhook', sample: { orderId: '1001', total: 99.99, customer: 'John Doe', email: 'john@email.com', items: 3 } },
              { id: 'order_paid', name: 'Order Paid', description: 'Triggers when order payment is captured', type: 'webhook', sample: { orderId: '1001', amount: 99.99, paymentMethod: 'credit_card' } },
              { id: 'order_cancelled', name: 'Order Cancelled', description: 'Triggers when order is cancelled', type: 'webhook', sample: { orderId: '1001', reason: 'Customer request', refundStatus: 'pending' } },
              { id: 'new_customer', name: 'New Customer', description: 'Triggers when new customer signs up', type: 'webhook', sample: { customerId: 'cust123', email: 'john@email.com', firstName: 'John', lastName: 'Doe' } },
              { id: 'product_created', name: 'Product Created', description: 'Triggers when new product is added', type: 'webhook', sample: { productId: 'prod123', title: 'T-Shirt', price: 29.99, inventory: 100 } },
              { id: 'low_inventory', name: 'Low Inventory Alert', description: 'Triggers when product inventory is low', type: 'webhook', sample: { productId: 'prod123', title: 'T-Shirt', inventory: 5, threshold: 10 } },
            ],
            actions: [
              { id: 'create_order', name: 'Create Order', description: 'Create new order', inputFields: [{ name: 'lineItems', type: 'text', required: true, label: 'Line Items (JSON)' }, { name: 'customerId', type: 'string', required: false, label: 'Customer ID' }, { name: 'email', type: 'string', required: false, label: 'Customer Email' }, { name: 'note', type: 'text', required: false, label: 'Note' }] },
              { id: 'update_order', name: 'Update Order', description: 'Update order details', inputFields: [{ name: 'orderId', type: 'string', required: true, label: 'Order ID' }, { name: 'note', type: 'text', required: false, label: 'Note' }, { name: 'tags', type: 'string', required: false, label: 'Tags (comma-separated)' }] },
              { id: 'cancel_order', name: 'Cancel Order', description: 'Cancel an order', inputFields: [{ name: 'orderId', type: 'string', required: true, label: 'Order ID' }, { name: 'reason', type: 'select', required: false, label: 'Reason', options: ['inventory', 'customer', 'fraud', 'other'] }] },
              { id: 'create_customer', name: 'Create Customer', description: 'Create new customer', inputFields: [{ name: 'email', type: 'string', required: true, label: 'Email' }, { name: 'firstName', type: 'string', required: false, label: 'First Name' }, { name: 'lastName', type: 'string', required: false, label: 'Last Name' }, { name: 'phone', type: 'string', required: false, label: 'Phone' }] },
              { id: 'update_inventory', name: 'Update Inventory', description: 'Update product inventory', inputFields: [{ name: 'inventoryItemId', type: 'string', required: true, label: 'Inventory Item ID' }, { name: 'locationId', type: 'string', required: true, label: 'Location ID' }, { name: 'available', type: 'number', required: true, label: 'Available Quantity' }] },
              { id: 'send_fulfillment', name: 'Create Fulfillment', description: 'Create fulfillment for order', inputFields: [{ name: 'orderId', type: 'string', required: true, label: 'Order ID' }, { name: 'trackingNumber', type: 'string', required: false, label: 'Tracking Number' }, { name: 'trackingCompany', type: 'string', required: false, label: 'Tracking Company' }, { name: 'lineItems', type: 'text', required: false, label: 'Line Items (JSON, all if empty)' }] },
              { id: 'add_tags', name: 'Add Tags to Order', description: 'Add tags to existing order', inputFields: [{ name: 'orderId', type: 'string', required: true, label: 'Order ID' }, { name: 'tags', type: 'string', required: true, label: 'Tags (comma-separated)' }] },
              { id: 'get_order', name: 'Get Order', description: 'Retrieve order details', inputFields: [{ name: 'orderId', type: 'string', required: true, label: 'Order ID' }] },
              { id: 'refund_order', name: 'Refund Order', description: 'Create refund for order', inputFields: [{ name: 'orderId', type: 'string', required: true, label: 'Order ID' }, { name: 'reason', type: 'select', required: false, label: 'Reason', options: ['duplicate', 'fraudulent', 'requested_by_customer'] }, { name: 'note', type: 'text', required: false, label: 'Note' }] },
            ]
          },
        ];
        return res.status(200).json({ success: true, data: { integrations } });
      }

      case 'workflows': {
        if (req.method === 'POST') {
          if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

          const { name, description, status: wfStatus, trigger, actions } = req.body || {};
          if (!name) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'Name required' } });

          const workflow = await prisma.workflow.create({
            data: {
              userId,
              name,
              description,
              status: wfStatus || 'draft',
              triggerConfig: trigger ? JSON.stringify(trigger) : '{}',
              actions: actions ? JSON.stringify(actions) : '[]',
              isActive: false,
            },
          });

          return res.status(201).json({ success: true, data: { workflow } });
        }

        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const workflows = await prisma.workflow.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
        });

        return res.status(200).json({ success: true, data: { workflows } });
      }

      case 'workflows_get': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const workflow = await prisma.workflow.findFirst({
          where: { id: id as string, userId },
          include: { workflowRuns: { take: 10, orderBy: { createdAt: 'desc' } } },
        });

        if (!workflow) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const normalized = {
          ...workflow,
          triggerConfig: typeof workflow.triggerConfig === 'string' ? JSON.parse(workflow.triggerConfig) : workflow.triggerConfig,
          actions: typeof workflow.actions === 'string' ? JSON.parse(workflow.actions) : workflow.actions,
          workflowRuns: workflow.workflowRuns,
        };

        return res.status(200).json({ success: true, data: { workflow: normalized } });
      }

      case 'workflows_update': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const { status: wfStatus, isActive, name, description } = req.body || {};

        const existing = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!existing) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const updateData: any = {};
        if (wfStatus !== undefined) updateData.status = wfStatus;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;

        const workflow = await prisma.workflow.update({ where: { id: id as string }, data: updateData });
        return res.status(200).json({ success: true, data: { workflow } });
      }

      case 'workflows_delete': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const existing = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!existing) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        await prisma.workflowRun.deleteMany({ where: { workflowId: id as string } });
        await prisma.workflow.delete({ where: { id: id as string } });

        return res.status(200).json({ success: true, message: 'Workflow deleted' });
      }

      case 'connections': {
        if (req.method === 'POST') {
          if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

          const { integrationId } = req.body || {};
          if (!integrationId) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'Integration ID required' } });

          const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
          if (!integration) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Integration not found' } });

          const connection = await prisma.connection.create({
            data: { userId, integrationId, accessToken: 'oauth_token_' + Date.now(), provider: 'oauth', displayName: integration.name, status: 'active' },
            include: { integration: true },
          });

          return res.status(201).json({ success: true, data: { connection: { id: connection.id, integrationId: connection.integrationId, integration: connection.integration, provider: connection.provider, displayName: connection.displayName, status: connection.status } } });
        }

        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const connections = await prisma.connection.findMany({
          where: { userId },
          include: { integration: true },
          orderBy: { createdAt: 'desc' },
        });

        return res.status(200).json({ success: true, data: { connections } });
      }

      case 'connections_delete': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const { id: connId } = req.body || {};
        if (!connId) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const existing = await prisma.connection.findFirst({ where: { id: connId, userId } });
        if (!existing) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Connection not found' } });

        await prisma.connection.delete({ where: { id: connId } });
        return res.status(200).json({ success: true, message: 'Connection deleted' });
      }

      case 'runs': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const where: any = { workflow: { userId } };
        if (workflowId) where.workflowId = workflowId as string;
        if (status) where.status = status as string;

        const limitNum = parseInt(limit as string) || 20;
        const pageNum = parseInt(page as string) || 1;
        const skip = (pageNum - 1) * limitNum;

        const [runs, total] = await Promise.all([
          prisma.workflowRun.findMany({
            where,
            include: { workflow: { select: { id: true, name: true } } },
            orderBy: { startedAt: 'desc' },
            skip,
            take: limitNum,
          }),
          prisma.workflowRun.count({ where }),
        ]);

        return res.status(200).json({
          success: true,
          data: {
            runs,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
          },
        });
      }

      case 'runs_get': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const run = await prisma.workflowRun.findFirst({
          where: { id: id as string, workflow: { userId } },
          include: { workflow: { select: { id: true, name: true } } },
        });

        if (!run) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Run not found' } });

        return res.status(200).json({
          success: true,
          data: {
            run: {
              ...run,
              triggerData: typeof run.triggerData === 'string' ? JSON.parse(run.triggerData) : run.triggerData,
              steps: typeof run.steps === 'string' ? JSON.parse(run.steps) : run.steps,
              executionData: typeof run.executionData === 'string' ? JSON.parse(run.executionData) : run.executionData,
            },
          },
        });
      }

      case 'trigger_test': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const { integrationId, triggerId, config } = req.body || {};

        const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
        if (!integration) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Integration not found' } });

        const triggers = typeof integration.triggers === 'string' ? JSON.parse(integration.triggers) : integration.triggers;
        const trigger = triggers.find((t: any) => t.id === triggerId);

        if (!trigger) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Trigger not found' } });

        return res.status(200).json({
          success: true,
          data: {
            trigger,
            sampleData: trigger.sample || { message: 'Sample trigger data - configure your integration to get real data' },
          },
        });
      }

      case 'action_test': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });

        const { integrationId, actionId, config } = req.body || {};

        const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
        if (!integration) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Integration not found' } });

        const actions = typeof integration.actions === 'string' ? JSON.parse(integration.actions) : integration.actions;
        const action = actions.find((a: any) => a.id === actionId);

        if (!action) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Action not found' } });

        return res.status(200).json({
          success: true,
          data: {
            action,
            result: { success: true, message: `Action "${action.name}" would execute with provided config`, simulated: true },
          },
        });
      }

      case 'workflow_activate': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const workflow = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!workflow) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const triggerConfig = typeof workflow.triggerConfig === 'string' ? JSON.parse(workflow.triggerConfig) : workflow.triggerConfig;
        if (!triggerConfig?.integrationId || !triggerConfig?.triggerId) {
          return res.status(400).json({ success: false, error: { statusCode: 400, message: 'Workflow must have a trigger configured before activation' } });
        }

        const updated = await prisma.workflow.update({
          where: { id: id as string },
          data: { status: 'active', isActive: true },
        });

        return res.status(200).json({ success: true, data: { workflow: updated } });
      }

      case 'workflow_trigger_manual': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const workflow = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!workflow) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const triggerConfig = typeof workflow.triggerConfig === 'string' ? JSON.parse(workflow.triggerConfig) : workflow.triggerConfig;
        const actions = typeof workflow.actions === 'string' ? JSON.parse(workflow.actions) : workflow.actions;

        const startTime = Date.now();
        const steps: any[] = [];
        let errorMessage: string | null = null;
        let status = 'success';

        try {
          const triggerData = req.body?.triggerData || { triggeredAt: new Date().toISOString(), source: 'manual' };

          steps.push({
            name: `Trigger: ${triggerConfig.integrationId}`,
            type: 'trigger',
            status: 'success',
            duration: 0,
            output: triggerData,
          });

          for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const stepStart = Date.now();

            try {
              const resolvedConfig = resolveMappings(action.config || {}, triggerData);

              steps.push({
                name: `Action: ${action.integrationId}.${action.actionId}`,
                type: 'action',
                status: 'success',
                duration: Date.now() - stepStart,
                input: resolvedConfig,
                output: { simulated: true, message: `Action executed successfully` },
              });
            } catch (actionError: any) {
              steps.push({
                name: `Action: ${action.integrationId}.${action.actionId}`,
                type: 'action',
                status: 'failed',
                duration: Date.now() - stepStart,
                error: actionError.message,
              });

              if (!action.continueOnError) {
                throw actionError;
              }
            }
          }

          await prisma.workflow.update({
            where: { id: workflow.id },
            data: {
              runCount: { increment: 1 },
              successCount: { increment: status === 'success' ? 1 : 0 },
              failureCount: { increment: status === 'failed' ? 1 : 0 },
              lastRunAt: new Date(),
            },
          });

          const run = await prisma.workflowRun.create({
            data: {
              workflowId: workflow.id,
              status,
              triggerData: JSON.stringify(triggerData),
              steps: JSON.stringify(steps),
              errorMessage,
              startedAt: new Date(startTime),
              completedAt: new Date(),
              durationMs: Date.now() - startTime,
            },
          });

          return res.status(200).json({
            success: true,
            data: {
              runId: run.id,
              status,
              steps: steps.length,
              durationMs: Date.now() - startTime,
            },
          });
        } catch (error: any) {
          status = 'failed';
          errorMessage = error.message;

          await prisma.workflow.update({
            where: { id: workflow.id },
            data: {
              runCount: { increment: 1 },
              failureCount: { increment: 1 },
              lastRunAt: new Date(),
            },
          });

          const run = await prisma.workflowRun.create({
            data: {
              workflowId: workflow.id,
              status: 'failed',
              triggerData: JSON.stringify(req.body?.triggerData || {}),
              steps: JSON.stringify(steps),
              errorMessage,
              errorStack: error.stack,
              startedAt: new Date(startTime),
              completedAt: new Date(),
              durationMs: Date.now() - startTime,
            },
          });

          return res.status(500).json({
            success: false,
            error: { message: errorMessage, runId: run.id },
          });
        }
      }

      case 'workflow_duplicate': {
        if (!userId) return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Unauthorized' } });
        if (!id) return res.status(400).json({ success: false, error: { statusCode: 400, message: 'ID required' } });

        const workflow = await prisma.workflow.findFirst({ where: { id: id as string, userId } });
        if (!workflow) return res.status(404).json({ success: false, error: { statusCode: 404, message: 'Workflow not found' } });

        const duplicated = await prisma.workflow.create({
          data: {
            userId,
            name: `${workflow.name} (Copy)`,
            description: workflow.description,
            status: 'draft',
            triggerConfig: workflow.triggerConfig,
            actions: workflow.actions,
            isActive: false,
          },
        });

        return res.status(201).json({ success: true, data: { workflow: duplicated } });
      }

      case 'templates': {
        const templates = [
          {
            id: 'gmail-to-notion-task',
            name: 'New Email to Notion Task',
            description: 'Create a Notion task whenever you receive an email from a specific sender',
            category: 'Operations',
            icon: '📧',
            popularity: 95,
            isVerified: true,
            isNew: false,
            estimatedTime: '2 min',
            trigger: { integrationId: 'gmail', triggerId: 'new_email_from', config: { senderFilter: '' } },
            actions: [
              { id: 'action-1', integrationId: 'notion', actionId: 'create_page', config: { database_id: '', title: '{{trigger.subject}}', properties: { Status: 'To Do', Priority: 'Medium' } } },
            ],
          },
          {
            id: 'sheets-to-slack-alert',
            name: 'Spreadsheet Row to Slack Alert',
            description: 'Send a Slack message when a new row is added to Google Sheets',
            category: 'Operations',
            icon: '📊',
            popularity: 92,
            isVerified: true,
            isNew: false,
            estimatedTime: '3 min',
            trigger: { integrationId: 'google_sheets', triggerId: 'new_row', config: { spreadsheet: '', sheet: '' } },
            actions: [
              { id: 'action-1', integrationId: 'slack', actionId: 'send_message', config: { channel: '#alerts', text: 'New row added: {{trigger.data}}' } },
            ],
          },
          {
            id: 'github-issue-to-slack',
            name: 'GitHub Issue to Slack Notification',
            description: 'Get notified in Slack when a new GitHub issue is created',
            category: 'Development',
            icon: '🐙',
            popularity: 89,
            isVerified: true,
            isNew: false,
            estimatedTime: '4 min',
            trigger: { integrationId: 'github', triggerId: 'new_issue', config: { repo: '' } },
            actions: [
              { id: 'action-1', integrationId: 'slack', actionId: 'send_message', config: { channel: '#engineering', text: 'New issue: {{trigger.title}} by {{trigger.author}}' } },
            ],
          },
          {
            id: 'hubspot-contact-to-slack',
            name: 'New HubSpot Contact Alert',
            description: 'Notify your sales team in Slack when a new contact is created in HubSpot',
            category: 'Sales',
            icon: '🔷',
            popularity: 87,
            isVerified: true,
            isNew: false,
            estimatedTime: '3 min',
            trigger: { integrationId: 'hubspot', triggerId: 'new_contact', config: {} },
            actions: [
              { id: 'action-1', integrationId: 'slack', actionId: 'send_message', config: { channel: '#sales', text: 'New contact: {{trigger.firstName}} {{trigger.lastName}} ({{trigger.email}})' } },
            ],
          },
          {
            id: 'schedule-weekly-report',
            name: 'Weekly Report to Email',
            description: 'Send a weekly summary report to your team every Monday',
            category: 'Communication',
            icon: '📅',
            popularity: 85,
            isVerified: true,
            isNew: false,
            estimatedTime: '5 min',
            trigger: { integrationId: 'schedule', triggerId: 'every_week', config: {} },
            actions: [
              { id: 'action-1', integrationId: 'gmail', actionId: 'send_email', config: { to: 'team@company.com', subject: 'Weekly Report - {{date}}', body: 'Please find attached the weekly report...' } },
            ],
          },
          {
            id: 'notion-to-google-calendar',
            name: 'Notion Task to Calendar Event',
            description: 'Create a Google Calendar event when a task is created in Notion',
            category: 'Productivity',
            icon: '📝',
            popularity: 83,
            isVerified: true,
            isNew: false,
            estimatedTime: '4 min',
            trigger: { integrationId: 'notion', triggerId: 'new_database_item', config: { database_id: '' } },
            actions: [
              { id: 'action-1', integrationId: 'google_calendar', actionId: 'create_event', config: { summary: '{{trigger.title}}', start: '{{trigger.dueDate}}', end: '{{trigger.dueDate}}' } },
            ],
          },
          {
            id: 'webhook-to-gmail',
            name: 'Webhook to Email Notification',
            description: 'Send an email notification when incoming webhook is received',
            category: 'Communication',
            icon: '🪝',
            popularity: 80,
            isVerified: true,
            isNew: false,
            estimatedTime: '2 min',
            trigger: { integrationId: 'webhook', triggerId: 'incoming_webhook', config: {} },
            actions: [
              { id: 'action-1', integrationId: 'gmail', actionId: 'send_email', config: { to: 'alerts@company.com', subject: 'Webhook Triggered: {{trigger.event}}', body: 'Received: {{trigger.data}}' } },
            ],
          },
          {
            id: 'gmail-to-google-sheets',
            name: 'Email Data to Spreadsheet',
            description: 'Log new emails with attachments to Google Sheets',
            category: 'Operations',
            icon: '📧',
            popularity: 78,
            isVerified: true,
            isNew: false,
            estimatedTime: '3 min',
            trigger: { integrationId: 'gmail', triggerId: 'new_attachment', config: {} },
            actions: [
              { id: 'action-1', integrationId: 'google_sheets', actionId: 'create_row', config: { spreadsheet: '', sheet: 'Emails', values: { Date: '{{trigger.date}}', From: '{{trigger.from}}', Subject: '{{trigger.subject}}', Attachment: '{{trigger.attachment}}' } } },
            ],
          },
          {
            id: 'slack-to-notion',
            name: 'Slack Message to Notion Page',
            description: 'Create a Notion page when a message with specific keyword is posted',
            category: 'Productivity',
            icon: '💬',
            popularity: 76,
            isVerified: true,
            isNew: false,
            estimatedTime: '3 min',
            trigger: { integrationId: 'slack', triggerId: 'new_message_keyword', config: { keyword: '' } },
            actions: [
              { id: 'action-1', integrationId: 'notion', actionId: 'create_page', config: { parentId: '', title: 'Slack: {{trigger.text}}', content: 'From: {{trigger.user}}\nChannel: {{trigger.channel}}\n\n{{trigger.text}}' } },
            ],
          },
          {
            id: 'hubspot-deal-to-calendar',
            name: 'HubSpot Deal Follow-up',
            description: 'Create a calendar reminder when a deal reaches negotiation stage',
            category: 'Sales',
            icon: '🔷',
            popularity: 74,
            isVerified: true,
            isNew: false,
            estimatedTime: '4 min',
            trigger: { integrationId: 'hubspot', triggerId: 'deal_stage_changed', config: { newStage: 'Negotiation' } },
            actions: [
              { id: 'action-1', integrationId: 'google_calendar', actionId: 'create_event', config: { summary: 'Follow up: {{trigger.dealName}}', start: '{{date+3days}}', end: '{{date+3days+1hour}}', description: 'Follow up on deal: ${{trigger.amount}}' } },
            ],
          },
          {
            id: 'github-pr-to-notify',
            name: 'GitHub PR Review Request',
            description: 'Notify in Slack when a PR needs review',
            category: 'Development',
            icon: '🐙',
            popularity: 72,
            isVerified: true,
            isNew: false,
            estimatedTime: '4 min',
            trigger: { integrationId: 'github', triggerId: 'new_pull_request', config: { repo: '' } },
            actions: [
              { id: 'action-1', integrationId: 'slack', actionId: 'send_message', config: { channel: '#code-review', text: 'PR Review Needed: {{trigger.title}}\nAuthor: {{trigger.author}}\nLink: {{trigger.url}}' } },
            ],
          },
          {
            id: 'daily-weather-reminder',
            name: 'Daily Weather Reminder',
            description: 'Send yourself a daily weather update every morning',
            category: 'Personal',
            icon: '☀️',
            popularity: 70,
            isVerified: true,
            isNew: false,
            estimatedTime: '2 min',
            trigger: { integrationId: 'schedule', triggerId: 'every_day', config: {} },
            actions: [
              { id: 'action-1', integrationId: 'gmail', actionId: 'send_email', config: { to: '{{user.email}}', subject: 'Good Morning! ☀️', body: 'Here is your daily weather update...' } },
            ],
          },
          {
            id: 'form-response-to-crm',
            name: 'Form Response to CRM',
            description: 'Add new form respondents to HubSpot as contacts',
            category: 'Marketing',
            icon: '📝',
            popularity: 88,
            isVerified: true,
            isNew: false,
            estimatedTime: '4 min',
            trigger: { integrationId: 'webhook', triggerId: 'incoming_webhook_json', config: {} },
            actions: [
              { id: 'action-1', integrationId: 'hubspot', actionId: 'create_contact', config: { email: '{{trigger.email}}', firstname: '{{trigger.firstName}}', lastname: '{{trigger.lastName}}', properties: { lead_source: 'Form' } } },
              { id: 'action-2', integrationId: 'slack', actionId: 'send_message', config: { channel: '#leads', text: 'New lead: {{trigger.firstName}} {{trigger.lastName}}' } },
            ],
          },
          {
            id: 'new-tweet-mention',
            name: 'New Twitter Mention',
            description: 'Get notified and save new Twitter mentions to Notion',
            category: 'Social',
            icon: '🐦',
            popularity: 65,
            isVerified: true,
            isNew: true,
            estimatedTime: '3 min',
            trigger: { integrationId: 'twitter', triggerId: 'new_mention', config: {} },
            actions: [
              { id: 'action-1', integrationId: 'slack', actionId: 'send_dm', config: { user: '{{user.twitter}}', text: 'You were mentioned by {{trigger.from}}: {{trigger.text}}' } },
              { id: 'action-2', integrationId: 'notion', actionId: 'create_page', config: { parentId: '', title: 'Mention: {{trigger.from}}', content: 'Tweet: {{trigger.text}}\nLink: {{trigger.url}}' } },
            ],
          },
          {
            id: 'calendar-event-to-slack',
            name: 'Calendar Event Reminder',
            description: 'Send Slack reminder 15 minutes before calendar events',
            category: 'Productivity',
            icon: '📅',
            popularity: 82,
            isVerified: true,
            isNew: false,
            estimatedTime: '3 min',
            trigger: { integrationId: 'google_calendar', triggerId: 'event_started', config: { minutesBefore: 15 } },
            actions: [
              { id: 'action-1', integrationId: 'slack', actionId: 'send_message', config: { channel: '#personal', text: '⏰ Upcoming: {{trigger.summary}} at {{trigger.start}}' } },
            ],
          },
          {
            id: 'google-sheets-approval',
            name: 'Approval Workflow',
            description: 'Send approval request when a spreadsheet row meets criteria',
            category: 'Operations',
            icon: '📊',
            popularity: 77,
            isVerified: true,
            isNew: false,
            estimatedTime: '5 min',
            trigger: { integrationId: 'google_sheets', triggerId: 'cell_matching', config: { column: 'Status', value: 'Pending Approval' } },
            actions: [
              { id: 'action-1', integrationId: 'gmail', actionId: 'send_email', config: { to: 'manager@company.com', subject: 'Approval Needed: {{trigger.rowData.Product}}', body: 'Please review and approve the following request...' } },
            ],
          },
          {
            id: 'stripe-payment-notify',
            name: 'Stripe Payment Alerts',
            description: 'Notify your team in Slack when payments are received',
            category: 'Payment',
            icon: '💳',
            popularity: 73,
            isVerified: true,
            isNew: true,
            estimatedTime: '3 min',
            trigger: { integrationId: 'stripe', triggerId: 'new_payment', config: {} },
            actions: [
              { id: 'action-1', integrationId: 'slack', actionId: 'send_message', config: { channel: '#revenue', text: '💰 Payment received: ${{trigger.amount/100}} from {{trigger.customer}}' } },
              { id: 'action-2', integrationId: 'google_sheets', actionId: 'create_row', config: { spreadsheet: '', sheet: 'Payments', values: { Date: '{{trigger.date}}', Customer: '{{trigger.customer}}', Amount: '{{trigger.amount}}', Status: '{{trigger.status}}' } } },
            ],
          },
          {
            id: 'notion-task-reminder',
            name: 'Notion Task Due Date Reminder',
            description: 'Send Slack reminder when Notion task is due soon',
            category: 'Productivity',
            icon: '📝',
            popularity: 71,
            isVerified: true,
            isNew: false,
            estimatedTime: '3 min',
            trigger: { integrationId: 'notion', triggerId: 'database_item_updated', config: {} },
            actions: [
              { id: 'action-1', integrationId: 'slack', actionId: 'send_message', config: { channel: '#tasks', text: '⚠️ Task due soon: {{trigger.title}} - Due: {{trigger.dueDate}}' } },
            ],
          },
          {
            id: 'github-release-to-all',
            name: 'GitHub Release Announcement',
            description: 'Announce new releases across Slack and Email',
            category: 'Development',
            icon: '🐙',
            popularity: 69,
            isVerified: true,
            isNew: false,
            estimatedTime: '4 min',
            trigger: { integrationId: 'github', triggerId: 'new_release', config: { repo: '' } },
            actions: [
              { id: 'action-1', integrationId: 'slack', actionId: 'send_message', config: { channel: '#announcements', text: '🎉 New Release: {{trigger.name}}\n{{trigger.body}}' } },
              { id: 'action-2', integrationId: 'gmail', actionId: 'send_email', config: { to: 'subscribers@company.com', subject: 'New Version Released: {{trigger.name}}', body: 'We are excited to announce...{{trigger.body}}' } },
            ],
          },
          {
            id: 'new-signup-welcome',
            name: 'New User Welcome Sequence',
            description: 'Send welcome email and create Notion onboarding task for new signups',
            category: 'Marketing',
            icon: '🎉',
            popularity: 86,
            isVerified: true,
            isNew: false,
            estimatedTime: '5 min',
            trigger: { integrationId: 'webhook', triggerId: 'incoming_webhook_json', config: { event: 'user.signup' } },
            actions: [
              { id: 'action-1', integrationId: 'gmail', actionId: 'send_email', config: { to: '{{trigger.email}}', subject: 'Welcome to Nexus! 🎉', body: 'Hi {{trigger.name}},\n\nWelcome aboard! We are excited to have you...' } },
              { id: 'action-2', integrationId: 'notion', actionId: 'create_page', config: { parentId: '', title: 'Onboarding: {{trigger.name}}', content: 'New user: {{trigger.name}}\nEmail: {{trigger.email}}\nSigned up: {{trigger.date}}' } },
            ],
          },
        ];

        const { category, search } = req.query;
        let filtered = templates;

        if (category && category !== 'all') {
          filtered = filtered.filter(t => t.category.toLowerCase() === (category as string).toLowerCase());
        }

        if (search) {
          const searchLower = (search as string).toLowerCase();
          filtered = filtered.filter(t =>
            t.name.toLowerCase().includes(searchLower) ||
            t.description.toLowerCase().includes(searchLower)
          );
        }

        return res.status(200).json({ success: true, data: { templates: filtered } });
      }

      case 'teams': {
        const teams = await prisma.team.findMany({
          where: { members: { some: { userId } } },
          include: {
            members: {
              include: { userId: undefined, user: { select: { id: true, name: true, email: true, avatarUrl: true } } as any },
              omit: { userId: true }
            },
            _count: { select: { members: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ success: true, data: { teams } });
      }

      case 'team_create': {
        if (!userId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        const { name, slug, description } = req.body;
        if (!name || !slug) return res.status(400).json({ success: false, error: { message: 'Name and slug required' } });

        const existing = await prisma.team.findUnique({ where: { slug } });
        if (existing) return res.status(400).json({ success: false, error: { message: 'Slug already taken' } });

        const team = await prisma.team.create({
          data: {
            name,
            slug,
            description,
            members: { create: { userId, role: 'owner' } }
          },
          include: { members: true }
        });
        return res.status(201).json({ success: true, data: { team } });
      }

      case 'team_invite': {
        if (!userId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        const { teamId, email, role } = req.body;
        if (!teamId || !email) return res.status(400).json({ success: false, error: { message: 'Team ID and email required' } });

        const member = await prisma.teamMember.findFirst({ where: { teamId, userId } });
        if (!member || !['owner', 'admin'].includes(member.role)) {
          return res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
        }

        const token = Buffer.from(`${email}-${Date.now()}`).toString('base64');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const invitation = await prisma.teamInvitation.create({
          data: { teamId, email, role: role || 'member', token, expiresAt }
        });
        return res.status(201).json({ success: true, data: { invitation, inviteUrl: `https://nexus.app/join/${token}` } });
      }

      case 'team_accept_invite': {
        if (!userId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        const { token } = req.body;
        if (!token) return res.status(400).json({ success: false, error: { message: 'Token required' } });

        const invitation = await prisma.teamInvitation.findUnique({ where: { token } });
        if (!invitation || invitation.expiresAt < new Date()) {
          return res.status(400).json({ success: false, error: { message: 'Invalid or expired invitation' } });
        }

        await prisma.teamMember.create({ data: { teamId: invitation.teamId, userId, role: invitation.role } });
        await prisma.teamInvitation.delete({ where: { id: invitation.id } });

        return res.status(200).json({ success: true, data: { message: 'Joined team successfully' } });
      }

      case 'team_remove_member': {
        if (!userId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        const { teamId, memberId } = req.body;

        const requester = await prisma.teamMember.findFirst({ where: { teamId, userId } });
        if (!requester || !['owner', 'admin'].includes(requester.role)) {
          return res.status(403).json({ success: false, error: { message: 'Insufficient permissions' } });
        }

        await prisma.teamMember.deleteMany({ where: { teamId, id: memberId } });
        return res.status(200).json({ success: true, data: { message: 'Member removed' } });
      }

      case 'team_leave': {
        if (!userId) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        const { teamId } = req.body;

        await prisma.teamMember.deleteMany({ where: { teamId, userId } });
        return res.status(200).json({ success: true, data: { message: 'Left team' } });
      }

      default:
        return res.status(400).json({ success: false, error: { message: 'Invalid resource' } });
    }
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, error: { statusCode: 500, message: error?.message || 'Internal server error' } });
  }
}

function resolveMappings(config: Record<string, any>, triggerData: Record<string, any>): Record<string, any> {
  const resolved: Record<string, any> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && value.includes('{{trigger.')) {
      resolved[key] = resolveString(value, triggerData);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

function resolveString(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{trigger\.([^}]+)\}\}/g, (_, path) => {
    const keys = path.split('.');
    let current: any = data;
    for (const key of keys) {
      if (current === null || current === undefined) return '';
      current = current[key];
    }
    return current !== null && current !== undefined ? String(current) : '';
  });
}