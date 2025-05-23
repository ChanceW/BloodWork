import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== 'STAFF') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: params.id
        }
      }
    })

    if (existingUser) {
      return new NextResponse('Email already exists', { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      email
    }

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Update patient
    const patient = await prisma.user.update({
      where: {
        id: params.id
      },
      data: updateData,
      select: {
        id: true,
        patientId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true
      }
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error updating patient:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== 'STAFF') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if patient exists
    const patient = await prisma.user.findUnique({
      where: {
        id: params.id
      }
    })

    if (!patient) {
      return new NextResponse('Patient not found', { status: 404 })
    }

    // Delete all results associated with the patient
    await prisma.result.deleteMany({
      where: {
        patientId: params.id
      }
    })

    // Delete all audit logs associated with the patient
    await prisma.auditLog.deleteMany({
      where: {
        patientId: params.id
      }
    })

    // Delete the patient
    await prisma.user.delete({
      where: {
        id: params.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 