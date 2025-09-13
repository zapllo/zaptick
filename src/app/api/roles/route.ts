import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import Role from '@/models/Role';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = verifyToken(token) as { id: string };
        if (!decoded || !decoded.id) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();

        // Get current user to verify company
        const currentUser = await User.findById(decoded.id).select('companyId role');
        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        // Only allow owners and admins to manage users
        const isOwnerOrAdmin = currentUser.isOwner || currentUser.role === 'owner' || currentUser.role === 'admin';
        if (!isOwnerOrAdmin) {
            return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
        }

        const roles = await Role.find({ companyId: currentUser.companyId }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            roles
        });

    } catch (error) {
        console.error('Error fetching roles:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch roles' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = verifyToken(token) as { id: string };
        if (!decoded || !decoded.id) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();

        // Get current user to verify company and permissions
        const currentUser = await User.findById(decoded.id).select('companyId role');
        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Only allow admins to create roles
        // if (currentUser.role !== 'admin') {
        //     return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
        // }
        const isOwnerOrAdmin = currentUser.isOwner || currentUser.role === 'owner' || currentUser.role === 'admin';
        if (!isOwnerOrAdmin) {
            return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
        }

        const { name, description, permissions, isDefault } = await req.json();

        // Validate required fields
        if (!name || !permissions) {
            return NextResponse.json(
                { success: false, message: 'Name and permissions are required' },
                { status: 400 }
            );
        }

        // Check if role name already exists for this company
        const existingRole = await Role.findOne({
            name: name.trim(),
            companyId: currentUser.companyId
        });

        if (existingRole) {
            return NextResponse.json(
                { success: false, message: 'Role name already exists' },
                { status: 400 }
            );
        }

        // If setting as default, remove default from other roles
        if (isDefault) {
            await Role.updateMany(
                { companyId: currentUser.companyId },
                { isDefault: false }
            );
        }

        const role = new Role({
            name: name.trim(),
            description: description?.trim(),
            companyId: currentUser.companyId,
            permissions,
            isDefault: isDefault || false
        });

        await role.save();

        return NextResponse.json({
            success: true,
            role,
            message: 'Role created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating role:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create role' },
            { status: 500 }
        );
    }
}