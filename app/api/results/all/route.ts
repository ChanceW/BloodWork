import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const results = await prisma.result.findMany({
      orderBy: {
        testDate: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching all results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 