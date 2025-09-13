import { sendEmail } from '@/lib/sendEmail';
import User from '@/models/User';
import Company from '@/models/Company';
import {
  templateCreationEmail,
  workflowCreationEmail,
  campaignCreationEmail,
  campaignLaunchEmail,
  contactImportEmail
} from '@/lib/emailTemplates';

const DASHBOARD_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function sendTemplateCreationNotification(
  userId: string,
  templateData: {
    name: string;
    category: string;
    language: string;
    status: string;
    wabaId: string;
  }
) {
  try {
    const user = await User.findById(userId).populate('companyId');
    if (!user) return;

    const company = user.companyId;
    const dashboardUrl = `${DASHBOARD_BASE_URL}/templates`;

    const emailData = {
      userName: user.name,
      templateName: templateData.name,
      templateCategory: templateData.category,
      templateLanguage: templateData.language,
      templateStatus: templateData.status,
      wabaId: templateData.wabaId,
      dashboardUrl
    };

    const emailTemplate = templateCreationEmail(emailData);

    // Send to the user who created the template
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });

    // Send to company owner if different from the creator
    if (!user.isOwner) {
      const owner = await User.findOne({ 
        companyId: company._id, 
        isOwner: true 
      });
      
      if (owner && owner.email !== user.email) {
        await sendEmail({
          to: owner.email,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html
        });
      }
    }
  } catch (error) {
    console.error('Failed to send template creation notification:', error);
  }
}

export async function sendWorkflowCreationNotification(
  userId: string,
  workflowData: {
    name: string;
    description?: string;
    wabaId: string;
  }
) {
  try {
    const user = await User.findById(userId).populate('companyId');
    if (!user) return;

    const company = user.companyId;
    const dashboardUrl = `${DASHBOARD_BASE_URL}/workflows`;

    const emailData = {
      userName: user.name,
      workflowName: workflowData.name,
      workflowDescription: workflowData.description,
      wabaId: workflowData.wabaId,
      dashboardUrl
    };

    const emailTemplate = workflowCreationEmail(emailData);

    // Send to the user who created the workflow
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });

    // Send to company owner if different from the creator
    if (!user.isOwner) {
      const owner = await User.findOne({ 
        companyId: company._id, 
        isOwner: true 
      });
      
      if (owner && owner.email !== user.email) {
        await sendEmail({
          to: owner.email,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html
        });
      }
    }
  } catch (error) {
    console.error('Failed to send workflow creation notification:', error);
  }
}

export async function sendCampaignCreationNotification(
  userId: string,
  campaignData: {
    name: string;
    type: string;
    audienceCount?: number;
  }
) {
  try {
    const user = await User.findById(userId).populate('companyId');
    if (!user) return;

    const company = user.companyId;
    const dashboardUrl = `${DASHBOARD_BASE_URL}/campaigns`;

    const emailData = {
      userName: user.name,
      campaignName: campaignData.name,
      campaignType: campaignData.type,
      audienceCount: campaignData.audienceCount,
      dashboardUrl
    };

    const emailTemplate = campaignCreationEmail(emailData);

    // Send to the user who created the campaign
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });

    // Send to company owner if different from the creator
    if (!user.isOwner) {
      const owner = await User.findOne({ 
        companyId: company._id, 
        isOwner: true 
      });
      
      if (owner && owner.email !== user.email) {
        await sendEmail({
          to: owner.email,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html
        });
      }
    }
  } catch (error) {
    console.error('Failed to send campaign creation notification:', error);
  }
}

export async function sendCampaignLaunchNotification(
  userId: string,
  campaignData: {
    name: string;
    audienceCount: number;
    totalCost: number;
    currency: string;
  }
) {
  try {
    const user = await User.findById(userId).populate('companyId');
    if (!user) return;

    const company = user.companyId;
    const dashboardUrl = `${DASHBOARD_BASE_URL}/campaigns`;

    const emailData = {
      userName: user.name,
      campaignName: campaignData.name,
      audienceCount: campaignData.audienceCount,
      totalCost: campaignData.totalCost,
      currency: campaignData.currency,
      dashboardUrl
    };

    const emailTemplate = campaignLaunchEmail(emailData);

    // Send to the user who launched the campaign
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });

    // Send to company owner if different from the launcher
    if (!user.isOwner) {
      const owner = await User.findOne({ 
        companyId: company._id, 
        isOwner: true 
      });
      
      if (owner && owner.email !== user.email) {
        await sendEmail({
          to: owner.email,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html
        });
      }
    }
  } catch (error) {
    console.error('Failed to send campaign launch notification:', error);
  }
}
// Add this function with your other notification functions
export async function sendContactImportNotification(
  userId: string,
  importData: {
    total: number;
    imported: number;
    skipped: number;
    errors: number;
    wabaId: string;
  }
) {
  try {
    const user = await User.findById(userId).populate('companyId');
    if (!user) return;

    const company = user.companyId;
    const dashboardUrl = `${DASHBOARD_BASE_URL}/contacts`;
    
    // Find WABA account name
    const wabaAccount = user.wabaAccounts?.find((account: any) => account.wabaId === importData.wabaId);
    const wabaName = wabaAccount?.businessName || 'WhatsApp Business Account';

    const emailData = {
      userName: user.name,
      totalContacts: importData.total,
      importedContacts: importData.imported,
      skippedContacts: importData.skipped,
      failedContacts: importData.errors,
      wabaName: wabaName,
      dashboardUrl,
      importDate: new Date().toLocaleDateString(),
      importTime: new Date().toLocaleTimeString()
    };

    const emailTemplate = contactImportEmail(emailData);

    // Send to the user who imported the contacts
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html
    });

    // Send to company owner if different from the importer
    if (!user.isOwner) {
      const owner = await User.findOne({ 
        companyId: company._id, 
        isOwner: true 
      });
      
      if (owner && owner.email !== user.email) {
        await sendEmail({
          to: owner.email,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html
        });
      }
    }
  } catch (error) {
    console.error('Failed to send contact import notification:', error);
  }
}