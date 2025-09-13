interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

interface TemplateData {
  userName: string;
  templateName: string;
  templateCategory: string;
  templateLanguage: string;
  templateStatus: string;
  wabaId: string;
  dashboardUrl: string;
}

interface WorkflowData {
  userName: string;
  workflowName: string;
  workflowDescription?: string;
  wabaId: string;
  dashboardUrl: string;
}

interface CampaignData {
  userName: string;
  campaignName: string;
  campaignType: string;
  audienceCount?: number;
  dashboardUrl: string;
}

interface CampaignLaunchData {
  userName: string;
  campaignName: string;
  audienceCount: number;
  totalCost: number;
  currency: string;
  dashboardUrl: string;
}


interface ContactImportData {
  userName: string;
  totalContacts: number;
  importedContacts: number;
  skippedContacts: number;
  failedContacts: number;
  wabaName: string;
  dashboardUrl: string;
  importDate: string;
  importTime: string;
}



export const templateCreationEmail = (data: TemplateData): EmailTemplate => ({
  subject: `New WhatsApp Template Created: ${data.templateName}`,
  text: `A new WhatsApp template "${data.templateName}" has been created by ${data.userName}. Category: ${data.templateCategory}, Language: ${data.templateLanguage}, Status: ${data.templateStatus}. View it at: ${data.dashboardUrl}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/zapzap.png" alt="Zaptick Logo" style="height: 40px;" />
      </div>
      <h2 style="color: #333; margin-bottom: 20px;">New WhatsApp Template Created</h2>
      <p style="color: #555; margin-bottom: 15px;">Hello,</p>
      <p style="color: #555; margin-bottom: 20px;">A new WhatsApp template has been created by <strong>${data.userName}</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Template Details:</h3>
        <p style="margin: 5px 0; color: #555;"><strong>Name:</strong> ${data.templateName}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Category:</strong> ${data.templateCategory}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Language:</strong> ${data.templateLanguage}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> ${data.templateStatus}</p>
        <p style="margin: 5px 0; color: #555;"><strong>WABA ID:</strong> ${data.wabaId}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.dashboardUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Templates</a>
      </div>

      <p style="color: #777; font-size: 12px; margin-top: 30px;">This is an automated notification from your WhatsApp Business account management system.</p>
    </div>
  `
});

export const workflowCreationEmail = (data: WorkflowData): EmailTemplate => ({
  subject: `New Workflow Created: ${data.workflowName}`,
  text: `A new workflow "${data.workflowName}" has been created by ${data.userName}. ${data.workflowDescription ? `Description: ${data.workflowDescription}. ` : ''}View it at: ${data.dashboardUrl}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/zapzap.png" alt="Zaptick Logo" style="height: 40px;" />
      </div>
      <h2 style="color: #333; margin-bottom: 20px;">New Workflow Created</h2>
      <p style="color: #555; margin-bottom: 15px;">Hello,</p>
      <p style="color: #555; margin-bottom: 20px;">A new workflow has been created by <strong>${data.userName}</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Workflow Details:</h3>
        <p style="margin: 5px 0; color: #555;"><strong>Name:</strong> ${data.workflowName}</p>
        ${data.workflowDescription ? `<p style="margin: 5px 0; color: #555;"><strong>Description:</strong> ${data.workflowDescription}</p>` : ''}
        <p style="margin: 5px 0; color: #555;"><strong>WABA ID:</strong> ${data.wabaId}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.dashboardUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Workflows</a>
      </div>

      <p style="color: #777; font-size: 12px; margin-top: 30px;">This is an automated notification from your WhatsApp Business account management system.</p>
    </div>
  `
});

export const campaignCreationEmail = (data: CampaignData): EmailTemplate => ({
  subject: `New Campaign Created: ${data.campaignName}`,
  text: `A new campaign "${data.campaignName}" (${data.campaignType}) has been created by ${data.userName}. ${data.audienceCount ? `Audience: ${data.audienceCount} contacts. ` : ''}View it at: ${data.dashboardUrl}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/zapzap.png" alt="Zaptick Logo" style="height: 40px;" />
      </div>
      <h2 style="color: #333; margin-bottom: 20px;">New Campaign Created</h2>
      <p style="color: #555; margin-bottom: 15px;">Hello,</p>
      <p style="color: #555; margin-bottom: 20px;">A new campaign has been created by <strong>${data.userName}</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Campaign Details:</h3>
        <p style="margin: 5px 0; color: #555;"><strong>Name:</strong> ${data.campaignName}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Type:</strong> ${data.campaignType}</p>
        ${data.audienceCount ? `<p style="margin: 5px 0; color: #555;"><strong>Audience:</strong> ${data.audienceCount} contacts</p>` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.dashboardUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Campaigns</a>
      </div>

      <p style="color: #777; font-size: 12px; margin-top: 30px;">This is an automated notification from your WhatsApp Business account management system.</p>
    </div>
  `
});

export const campaignLaunchEmail = (data: CampaignLaunchData): EmailTemplate => ({
  subject: `Campaign Launched: ${data.campaignName}`,
  text: `Campaign "${data.campaignName}" has been launched by ${data.userName}. Sending to ${data.audienceCount} contacts. Total cost: ${data.totalCost} ${data.currency}. View it at: ${data.dashboardUrl}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/zapzap.png" alt="Zaptick Logo" style="height: 40px;" />
      </div>
      <h2 style="color: #333; margin-bottom: 20px;">🚀 Campaign Launched</h2>
      <p style="color: #555; margin-bottom: 15px;">Hello,</p>
      <p style="color: #555; margin-bottom: 20px;">Campaign <strong>"${data.campaignName}"</strong> has been successfully launched by <strong>${data.userName}</strong>.</p>
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Launch Summary:</h3>
        <p style="margin: 5px 0; color: #555;"><strong>Campaign:</strong> ${data.campaignName}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Audience Size:</strong> ${data.audienceCount} contacts</p>
        <p style="margin: 5px 0; color: #555;"><strong>Total Cost:</strong> ${data.totalCost} ${data.currency}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> Active</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.dashboardUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Campaign</a>
      </div>

      <p style="color: #777; font-size: 12px; margin-top: 30px;">This is an automated notification. You can monitor the campaign progress in your dashboard.</p>
    </div>
  `
});

export const contactImportEmail = (data: ContactImportData): EmailTemplate => ({
  subject: `Contact Import Complete: ${data.importedContacts} Contacts Added`,
  text: `Contact import to ${data.wabaName} has been completed by ${data.userName}. Total processed: ${data.totalContacts}, Successfully imported: ${data.importedContacts}, Skipped: ${data.skippedContacts}, Failed: ${data.failedContacts}. Completed on ${data.importDate} at ${data.importTime}. View your contacts at: ${data.dashboardUrl}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/zapzap.png" alt="Zaptick Logo" style="height: 40px;" />
      </div>
      <h2 style="color: #333; margin-bottom: 20px;">Contact Import Complete</h2>
      <p style="color: #555; margin-bottom: 15px;">Hello,</p>
      <p style="color: #555; margin-bottom: 20px;">A contact import to <strong>${data.wabaName}</strong> has been completed by <strong>${data.userName}</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #333;">Import Summary:</h3>
        <p style="margin: 5px 0; color: #555;"><strong>Total Processed:</strong> ${data.totalContacts}</p>
        <p style="margin: 5px 0; color: #22c55e;"><strong>Successfully Imported:</strong> ${data.importedContacts}</p>
        <p style="margin: 5px 0; color: #f59e0b;"><strong>Skipped (Duplicates):</strong> ${data.skippedContacts}</p>
        <p style="margin: 5px 0; color: ${data.failedContacts > 0 ? '#ef4444' : '#555'};"><strong>Failed:</strong> ${data.failedContacts}</p>
        <p style="margin: 5px 0; color: #555;"><strong>Completed:</strong> ${data.importDate} at ${data.importTime}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.dashboardUrl}" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">View Contacts</a>
      </div>

      <p style="color: #777; font-size: 12px; margin-top: 30px;">This is an automated notification from your WhatsApp Business account management system.</p>
    </div>
  `
});