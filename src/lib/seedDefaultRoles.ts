import dbConnect from '@/lib/mongodb';
import Role from '@/models/Role';
import { ObjectId } from 'mongodb';

export async function seedDefaultRoles(companyId: string | ObjectId) {
  await dbConnect();

  try {
    // Check if default roles already exist for this company
    const existingRoles = await Role.find({ companyId });
    if (existingRoles.length > 0) {
      return; // Roles already exist
    }

    const defaultRoles = [
      {
        name: "Customer Support Agent",
        description: "Handle customer conversations and manage contacts",
        companyId,
        permissions: [
          { resource: "conversations", actions: ["read", "write"] },
          { resource: "contacts", actions: ["read", "write"] },
          { resource: "templates", actions: ["read"] },
          { resource: "dashboard", actions: ["read"] }
        ],
        isDefault: true
      },
      {
        name: "Sales Agent",
        description: "Manage sales conversations and campaigns",
        companyId,
        permissions: [
          { resource: "conversations", actions: ["read", "write"] },
          { resource: "contacts", actions: ["read", "write"] },
          { resource: "templates", actions: ["read", "write"] },
          { resource: "campaigns", actions: ["read", "write"] },
          { resource: "dashboard", actions: ["read"] },
          { resource: "analytics", actions: ["read"] }
        ],
        isDefault: false
      },
      {
        name: "Marketing Manager",
        description: "Full access to campaigns, templates, and analytics",
        companyId,
        permissions: [
          { resource: "conversations", actions: ["read"] },
          { resource: "contacts", actions: ["read", "write"] },
          { resource: "templates", actions: ["read", "write", "delete"] },
          { resource: "campaigns", actions: ["read", "write", "delete"] },
          { resource: "automations", actions: ["read", "write", "delete"] },
          { resource: "dashboard", actions: ["read"] },
          { resource: "analytics", actions: ["read"] },
          { resource: "integrations", actions: ["read", "write"] }
        ],
        isDefault: false
      },
      {
        name: "Read Only",
        description: "View-only access to most features",
        companyId,
        permissions: [
          { resource: "conversations", actions: ["read"] },
          { resource: "contacts", actions: ["read"] },
          { resource: "templates", actions: ["read"] },
          { resource: "campaigns", actions: ["read"] },
          { resource: "dashboard", actions: ["read"] },
          { resource: "analytics", actions: ["read"] }
        ],
        isDefault: false
      }
    ];

    await Role.insertMany(defaultRoles);
    console.log(`Default roles created for company ${companyId}`);

  } catch (error) {
    console.error('Error seeding default roles:', error);
  }
}