import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== 'STAFF') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const patients = await prisma.user.findMany({
      where: {
        role: 'PATIENT'
      },
      select: {
        id: true,
        patientId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== 'STAFF') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { patientId, name, email, password } = body

    if (!patientId || !name || !email || !password) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if patient ID or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { patientId },
          { email }
        ]
      }
    })

    if (existingUser) {
      return new NextResponse('Patient ID or email already exists', { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new patient
    const patient = await prisma.user.create({
      data: {
        patientId,
        name,
        email,
        password: hashedPassword,
        role: 'PATIENT'
      },
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
    console.error('Error creating patient:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 