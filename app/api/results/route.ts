import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'
import { sendNewResultEmail } from '@/lib/email'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const results = await prisma.result.findMany({
      where: {
        patientId: session.user.patientId,
      },
      orderBy: {
        testDate: 'desc',
      },
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { patientId, testName, testDate, values, referenceRange, assetId } = body

    // Create the result
    const result = await prisma.result.create({
      data: {
        patientId,
        testName,
        testDate: new Date(testDate),
        values,
        referenceRange,
        assetId,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        userId: session.user.id,
        resultId: result.id,
        details: {
          testName,
          testDate,
        },
      },
    })

    // Get patient information
    const patient = await prisma.user.findUnique({
      where: { patientId },
      select: {
        email: true,
        name: true,
      },
    })

    // Send email notification if patient exists
    if (patient?.email) {
      try {
        await sendNewResultEmail(
          patient.email,
          patient.name || 'Patient',
          testName,
          testDate
        )
      } catch (error) {
        console.error('Failed to send email notification:', error)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating result:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 