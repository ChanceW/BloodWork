import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'
import { sendResultUpdatedEmail } from '@/lib/email'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { testName, testDate, values, referenceRange, assetId } = body

    // Get the existing result to find the patient
    const existingResult = await prisma.result.findUnique({
      where: { id: params.id },
      select: {
        patientId: true,
      },
    })

    if (!existingResult) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      )
    }

    // Update the result
    const result = await prisma.result.update({
      where: { id: params.id },
      data: {
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
        action: 'UPDATE',
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
      where: { patientId: existingResult.patientId },
      select: {
        email: true,
        name: true,
      },
    })

    // Send email notification if patient exists
    if (patient?.email) {
      try {
        await sendResultUpdatedEmail(
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
    console.error('Error updating result:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create audit log before deleting
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        userId: session.user.id,
        resultId: params.id,
        details: {
          deletedAt: new Date().toISOString(),
        },
      },
    })

    await prisma.result.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting result:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 