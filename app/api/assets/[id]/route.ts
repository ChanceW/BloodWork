import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: {
        results: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this asset
    const hasAccess = session.user.role === 'STAFF' ||
      asset.results.some(result => result.patientId === session.user.patientId)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return new NextResponse(asset.data, {
      headers: {
        'Content-Type': asset.contentType,
        'Content-Disposition': `inline; filename="result-${params.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error retrieving asset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 