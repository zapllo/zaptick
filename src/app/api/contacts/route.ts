import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import ContactCustomField from '@/models/ContactCustomField';
import ContactGroup from '@/models/ContactGroup';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { name, phone, email, wabaId, tags, notes, customFields } = await req.json();

    if (!name || !phone || !wabaId) {
      return NextResponse.json({
        error: 'Missing required fields: name, phone, wabaId'
      }, { status: 400 });
    }

    // Find the WABA account
    const wabaAccount = user.wabaAccounts.find((account: any) => account.wabaId === wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: 'WABA account not found' }, { status: 404 });
    }

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      phone: phone.trim(),
      wabaId,
      companyId: user.companyId
    });

    if (existingContact) {
      return NextResponse.json({
        error: 'Contact with this phone number already exists'
      }, { status: 409 });
    }

    // Validate custom fields
    if (customFields) {
      // Get company's custom fields
      const companyCustomFields = await ContactCustomField.find({
        companyId: user.companyId,
        active: true
      });

      // Check required fields
      const missingRequiredFields = companyCustomFields
        .filter(field => field.required)
        .filter(field => {
          const fieldValue = customFields[field.key];
          return fieldValue === undefined || fieldValue === null || fieldValue === '';
        });

      if (missingRequiredFields.length > 0) {
        return NextResponse.json({
          error: `Missing required custom fields: ${missingRequiredFields.map(f => f.name).join(', ')}`
        }, { status: 400 });
      }
    }

    const contact = new Contact({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      wabaId,
      phoneNumberId: wabaAccount.phoneNumberId,
      userId: decoded.id,
      companyId: user.companyId,
      tags: tags || [],
      notes: notes?.trim(),
      customFields: customFields || {}
    });

    await contact.save();

    return NextResponse.json({
      success: true,
      contact: {
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        whatsappOptIn: contact.whatsappOptIn,
        tags: contact.tags,
        notes: contact.notes,
        customFields: contact.customFields || {},
        isActive: contact.isActive,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact creation error:', error);
    return NextResponse.json({
      error: 'Failed to create contact',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


// Update the main GET function to handle condition groups
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const wabaId = searchParams.get('wabaId');
    const search = searchParams.get('search');

    // Handle audience filter conditions
    const audienceFilters = searchParams.get('audienceFilters');
    let parsedFilters = null;

    if (audienceFilters) {
      try {
        parsedFilters = JSON.parse(audienceFilters);
        console.log('Parsed audience filters:', parsedFilters);
      } catch (error) {
        console.error('Error parsing audience filters:', error);
      }
    }

    // Build base query
    const query: any = {
      userId: decoded.id,
      companyId: user.companyId,
      isActive: true
    };

    if (wabaId) query.wabaId = wabaId;

    // Apply basic search (only if no audience filters)
    if (search && !parsedFilters) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    /// Apply audience filters
    if (parsedFilters) {
      const { tags, conditionGroups, groupOperator, whatsappOptedIn, contactGroups } = parsedFilters;

      const allConditions = [];

      // Apply contact groups filter - Enhanced version
      if (contactGroups && contactGroups.length > 0) {
        try {
          // Get all contact IDs from selected groups with better error handling
          const selectedGroups = await ContactGroup.find({
            _id: {
              $in: contactGroups.map((id: string) => {
                // Handle both string and ObjectId formats
                try {
                  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
                } catch {
                  return id;
                }
              })
            },
            userId: decoded.id,
            companyId: user.companyId,
            isActive: true
          }).select('contacts name').lean();

          console.log(`Found ${selectedGroups.length} contact groups for filtering`);

          // Flatten all contact IDs from all selected groups
          const contactIds = selectedGroups.reduce((acc: any[], group: any) => {
            if (group.contacts && Array.isArray(group.contacts)) {
              console.log(`Group "${group.name}" has ${group.contacts.length} contacts`);
              return acc.concat(group.contacts);
            }
            return acc;
          }, []);

          // Remove duplicates and convert to proper ObjectIds
          const uniqueContactIds = [...new Set(contactIds)].map(id => {
            try {
              return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
            } catch {
              return id;
            }
          });

          console.log(`Total unique contact IDs from groups: ${uniqueContactIds.length}`);

          if (uniqueContactIds.length > 0) {
            allConditions.push({ _id: { $in: uniqueContactIds } });
          } else {
            // If no contacts found in selected groups, return empty result
            console.log('No contacts found in selected groups, returning empty result');
            allConditions.push({ _id: { $in: [] } });
          }
        } catch (error) {
          console.error('Error processing contact groups filter:', error);
          // On error, don't apply contact group filter
        }
      }
      // Apply tag filters
      if (tags && tags.length > 0) {
        allConditions.push({ tags: { $in: tags } });
      }

      // Apply WhatsApp opt-in filter
      if (whatsappOptedIn) {
        allConditions.push({ whatsappOptIn: true });
      }

      // Apply condition groups
      if (conditionGroups && conditionGroups.length > 0) {
        const groupQueries = conditionGroups.map((group: any) => {
          const { conditions, operator } = group;

          if (conditions.length === 0) return null;

          // Process conditions within the group
          const groupConditionQueries = conditions.map((condition: any) => {
            const { field, operator: conditionOperator, value } = condition;

            console.log('Processing condition:', { field, operator: conditionOperator, value });

            // Handle different field types
            if (field === 'name' || field === 'email' || field === 'phone') {
              return buildFieldQuery(field, conditionOperator, value);
            } else if (field === 'createdAt' || field === 'lastMessageAt') {
              return buildDateQuery(field, conditionOperator, value);
            } else if (field.startsWith('customField.')) {
              const customFieldKey = field.replace('customField.', '');
              return buildCustomFieldQuery(customFieldKey, conditionOperator, value);
            }

            return null;
          }).filter(Boolean);

          if (groupConditionQueries.length === 0) return null;

          // Combine conditions within the group
          if (groupConditionQueries.length === 1) {
            return groupConditionQueries[0];
          } else {
            if (operator === 'OR') {
              return { $or: groupConditionQueries };
            } else {
              return { $and: groupConditionQueries };
            }
          }
        }).filter(Boolean);

        if (groupQueries.length > 0) {
          if (groupQueries.length === 1) {
            allConditions.push(groupQueries[0]);
          } else {
            // Combine groups with the group operator
            if (groupOperator === 'OR') {
              allConditions.push({ $or: groupQueries });
            } else {
              allConditions.push({ $and: groupQueries });
            }
          }
        }
      }

      // Apply all conditions
      if (allConditions.length > 0) {
        if (allConditions.length === 1) {
          Object.assign(query, allConditions[0]);
        } else {
          query.$and = allConditions;
        }
      }
    }

    // Handle legacy custom field filters (for backward compatibility)
    if (!parsedFilters) {
      const customFieldFilters: Record<string, any> = {};
      for (const [key, value] of searchParams.entries()) {
        if (key.startsWith('customField.') && value) {
          const fieldKey = key.replace('customField.', '');
          customFieldFilters[fieldKey] = value;
        }
      }

      // Add legacy custom field filters to query
      if (Object.keys(customFieldFilters).length > 0) {
        Object.entries(customFieldFilters).forEach(([key, value]) => {
          query[`customFields.${key}`] = { $regex: value, $options: 'i' };
        });
      }
    }

    console.log('Final MongoDB query:', JSON.stringify(query, null, 2));

    const contacts = await Contact.find(query)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    console.log(`Found ${contacts.length} contacts matching query`);

    return NextResponse.json({
      success: true,
      contacts: contacts.map(contact => ({
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        whatsappOptIn: contact.whatsappOptIn,
        tags: contact.tags,
        notes: contact.notes,
        customFields: contact.customFields || {},
        lastMessageAt: contact.lastMessageAt,
        isActive: contact.isActive,
        createdAt: contact.createdAt
      }))
    });

  } catch (error) {
    console.error('Contacts fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch contacts'
    }, { status: 500 });
  }
}

// Helper function to group conditions by field
function groupConditionsByField(conditions: any[]) {
  const grouped: Record<string, any[]> = {};

  conditions.forEach(condition => {
    const field = Object.keys(condition)[0];
    if (!grouped[field]) {
      grouped[field] = [];
    }
    grouped[field].push(condition);
  });

  return grouped;
}

// Helper function to combine multiple conditions on the same field
function combineFieldConditions(field: string, conditions: any[], operator: string) {
  console.log(`Combining ${conditions.length} conditions for field: ${field} with operator: ${operator}`);

  if (operator === 'OR') {
    // For OR logic, create an $or array with all conditions
    return {
      $or: conditions
    };
  } else {
    // For AND logic, we need to merge the conditions intelligently
    const mergedCondition: any = {};

    conditions.forEach(condition => {
      const fieldCondition = condition[field];

      if (typeof fieldCondition === 'object' && fieldCondition !== null) {
        // Merge operators like $gt, $lt, $gte, $lte
        Object.keys(fieldCondition).forEach(op => {
          if (op === '$gte' || op === '$gt') {
            // For greater than operations, take the maximum value
            if (!mergedCondition[op] || fieldCondition[op] > mergedCondition[op]) {
              mergedCondition[op] = fieldCondition[op];
            }
          } else if (op === '$lte' || op === '$lt') {
            // For less than operations, take the minimum value
            if (!mergedCondition[op] || fieldCondition[op] < mergedCondition[op]) {
              mergedCondition[op] = fieldCondition[op];
            }
          } else if (op === '$ne') {
            // For not equal, combine into $nin
            if (!mergedCondition['$nin']) {
              mergedCondition['$nin'] = [];
            }
            mergedCondition['$nin'].push(fieldCondition[op]);
          } else if (op === '$in') {
            // For $in, take intersection or union based on logic
            if (!mergedCondition['$in']) {
              mergedCondition['$in'] = fieldCondition[op];
            } else {
              // For AND, take intersection
              mergedCondition['$in'] = mergedCondition['$in'].filter((val: any) =>
                fieldCondition[op].includes(val)
              );
            }
          } else if (op === '$regex') {
            // For regex, combine patterns
            if (!mergedCondition['$and']) {
              mergedCondition['$and'] = [];
            }
            mergedCondition['$and'].push({ [field]: fieldCondition });
          } else {
            mergedCondition[op] = fieldCondition[op];
          }
        });
      } else {
        // Direct value comparison
        mergedCondition['$eq'] = fieldCondition;
      }
    });

    // If we have $and conditions, return them properly
    if (mergedCondition['$and']) {
      return { $and: mergedCondition['$and'] };
    }

    return { [field]: mergedCondition };
  }
}

// Keep the existing helper functions (buildDateQuery, buildFieldQuery, buildCustomFieldQuery)
// but update them to handle edge cases better...

function buildDateQuery(field: string, operator: string, value: any) {
  const query: any = {};

  console.log(`buildDateQuery called with: field=${field}, operator=${operator}, value=${value}, type=${typeof value}`);

  if (operator === 'is_unknown') {
    query[field] = { $in: [null, undefined] };
    return query;
  }

  if (operator === 'has_any_value') {
    query[field] = { $nin: [null, undefined] };
    return query;
  }

  if (!value && value !== 0) {
    console.log('No value provided for date query');
    return {};
  }

  let targetDate: Date;

  try {
    // Handle relative dates (number of days)
    if (typeof value === 'number' && (operator === 'more_than' || operator === 'exactly' || operator === 'less_than')) {
      const now = new Date();
      if (isNaN(now.getTime())) {
        console.error('Invalid current date');
        return {};
      }

      targetDate = new Date(now);
      targetDate.setDate(now.getDate() - value);
      targetDate.setHours(0, 0, 0, 0);
      console.log(`Relative date calculation: ${value} days ago = ${targetDate.toISOString()}`);
    } else {
      // Handle absolute dates - Parse in UTC to avoid timezone issues
      if (typeof value === 'string') {
        // Clean the value first
        const cleanValue = value.trim();

        if (cleanValue.includes('T')) {
          targetDate = new Date(cleanValue);
        } else if (cleanValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // For date-only strings like "2025-07-14", create date in UTC
          targetDate = new Date(cleanValue + 'T00:00:00.000Z');
        } else {
          // Try to parse as is
          targetDate = new Date(cleanValue);
        }
      } else if (value instanceof Date) {
        targetDate = value;
      } else {
        targetDate = new Date(value);
      }

      console.log(`Absolute date parsing: input=${value}, parsed=${targetDate.toISOString()}`);
    }

    // Validate date
    if (isNaN(targetDate.getTime())) {
      console.error('Invalid date value after parsing:', value);
      return {};
    }

  } catch (error) {
    console.error('Error parsing date:', error, 'value:', value);
    return {};
  }

  console.log(`Date query: field=${field}, operator=${operator}, value=${value}, targetDate=${targetDate.toISOString()}`);

  try {
    switch (operator) {
      case 'after':
        // After means > end of the target day (in UTC)
        const afterDate = new Date(targetDate);
        afterDate.setUTCHours(23, 59, 59, 999);
        query[field] = { $gt: afterDate };
        console.log(`After query: ${field} > ${afterDate.toISOString()}`);
        break;

      case 'on':
        // For "on" operator, match the entire day (in UTC)
        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        query[field] = { $gte: startOfDay, $lte: endOfDay };
        console.log(`On query: ${startOfDay.toISOString()} <= ${field} <= ${endOfDay.toISOString()}`);
        break;

      case 'before':
        // Before means < start of the target day (in UTC)
        const beforeDate = new Date(targetDate);
        beforeDate.setUTCHours(0, 0, 0, 0);
        query[field] = { $lt: beforeDate };
        console.log(`Before query: ${field} < ${beforeDate.toISOString()}`);
        break;

      case 'more_than':
        // For "more than X days ago" - created before X days ago (end of day)
        const moreThanDate = new Date(targetDate);
        moreThanDate.setUTCHours(23, 59, 59, 999);
        query[field] = { $lt: moreThanDate };
        console.log(`More than query: ${field} < ${moreThanDate.toISOString()}`);
        break;

      case 'exactly':
        // For "exactly X days ago" - created on that exact day (in UTC)
        const exactStartOfDay = new Date(targetDate);
        exactStartOfDay.setUTCHours(0, 0, 0, 0);
        const exactEndOfDay = new Date(targetDate);
        exactEndOfDay.setUTCHours(23, 59, 59, 999);
        query[field] = { $gte: exactStartOfDay, $lte: exactEndOfDay };
        console.log(`Exactly query: ${exactStartOfDay.toISOString()} <= ${field} <= ${exactEndOfDay.toISOString()}`);
        break;

      case 'less_than':
        // For "less than X days ago" - created after X days ago (start of day)
        const lessThanDate = new Date(targetDate);
        lessThanDate.setUTCHours(0, 0, 0, 0);
        query[field] = { $gt: lessThanDate };
        console.log(`Less than query: ${field} > ${lessThanDate.toISOString()}`);
        break;

      default:
        query[field] = targetDate;
    }
  } catch (error) {
    console.error('Error building date query:', error);
    return {};
  }

  console.log('Generated date query:', JSON.stringify(query, null, 2));
  return query;
}


// Helper function to build field queries
function buildFieldQuery(field: string, operator: string, value: any) {
  const query: any = {};

  switch (operator) {
    case 'equals':
      query[field] = value;
      break;
    case 'not_equals':
      query[field] = { $ne: value };
      break;
    case 'contains':
      query[field] = { $regex: value, $options: 'i' };
      break;
    case 'not_contains':
      query[field] = { $not: { $regex: value, $options: 'i' } };
      break;
    case 'is_unknown':
      query[field] = { $in: [null, undefined, ''] };
      break;
    case 'has_any_value':
      query[field] = { $nin: [null, undefined, ''] };
      break;
    default:
      query[field] = { $regex: value, $options: 'i' };
  }

  return query;
}
// Update the custom field date handling in buildCustomFieldQuery:

function buildCustomFieldQuery(fieldKey: string, operator: string, value: any) {
  const query: any = {};
  const fieldPath = `customFields.${fieldKey}`;

  switch (operator) {
    case 'equals':
      query[fieldPath] = value;
      break;
    case 'not_equals':
      query[fieldPath] = { $ne: value };
      break;
    case 'contains':
      query[fieldPath] = { $regex: value, $options: 'i' };
      break;
    case 'not_contains':
      query[fieldPath] = { $not: { $regex: value, $options: 'i' } };
      break;
    case 'greater_than':
      query[fieldPath] = { $gt: Number(value) };
      break;
    case 'less_than':
      query[fieldPath] = { $lt: Number(value) };
      break;
    case 'between':
      // Assuming value is an array [min, max]
      if (Array.isArray(value) && value.length === 2) {
        query[fieldPath] = { $gte: Number(value[0]), $lte: Number(value[1]) };
      }
      break;
    case 'is_unknown':
      query[fieldPath] = { $in: [null, undefined, ''] };
      break;
    case 'has_any_value':
      query[fieldPath] = { $nin: [null, undefined, ''] };
      break;
    // Date operators for custom fields - handle in UTC
    case 'after':
      const afterDate = new Date(value + 'T00:00:00.000Z');
      afterDate.setUTCHours(23, 59, 59, 999);
      query[fieldPath] = { $gt: afterDate };
      break;
    case 'on':
      const startOfDay = new Date(value + 'T00:00:00.000Z');
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(value + 'T00:00:00.000Z');
      endOfDay.setUTCHours(23, 59, 59, 999);
      query[fieldPath] = { $gte: startOfDay, $lte: endOfDay };
      break;
    case 'before':
      const beforeDate = new Date(value + 'T00:00:00.000Z');
      beforeDate.setUTCHours(0, 0, 0, 0);
      query[fieldPath] = { $lt: beforeDate };
      break;
    case 'more_than':
      if (typeof value === 'number') {
        const now = new Date();
        const daysAgo = new Date(now);
        daysAgo.setDate(now.getDate() - value);
        daysAgo.setUTCHours(23, 59, 59, 999);
        query[fieldPath] = { $lt: daysAgo };
      } else {
        const moreThanDate = new Date(value + 'T00:00:00.000Z');
        moreThanDate.setUTCHours(23, 59, 59, 999);
        query[fieldPath] = { $gt: moreThanDate };
      }
      break;
    case 'exactly':
      if (typeof value === 'number') {
        const now = new Date();
        const exactDate = new Date(now);
        exactDate.setDate(now.getDate() - value);
        const startOfDay = new Date(exactDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(exactDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        query[fieldPath] = { $gte: startOfDay, $lte: endOfDay };
      } else {
        const startOfDay = new Date(value + 'T00:00:00.000Z');
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(value + 'T00:00:00.000Z');
        endOfDay.setUTCHours(23, 59, 59, 999);
        query[fieldPath] = { $gte: startOfDay, $lte: endOfDay };
      }
      break;
    case 'less_than':
      if (typeof value === 'number') {
        const now = new Date();
        const daysAgo = new Date(now);
        daysAgo.setDate(now.getDate() - value);
        daysAgo.setUTCHours(0, 0, 0, 0);
        query[fieldPath] = { $gt: daysAgo };
      } else {
        const lessThanDate = new Date(value + 'T00:00:00.000Z');
        lessThanDate.setUTCHours(0, 0, 0, 0);
        query[fieldPath] = { $lt: lessThanDate };
      }
      break;
    default:
      query[fieldPath] = { $regex: value, $options: 'i' };
  }

  return query;
}