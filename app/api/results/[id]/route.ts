import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'

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