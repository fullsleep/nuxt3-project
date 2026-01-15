import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params.id)
    
    // 조회수 증가
    await prisma.sunriseinfo_tbl_board.update({
      where: {
        bno: id
      },
      data: {
        hitno: {
          increment: 1
        }
      }
    })
    
    // 게시물 조회
    const board = await prisma.sunriseinfo_tbl_board.findUnique({
      where: {
        bno: id
      },
      select: {
        bno: true,
        userid: true,
        writer: true,
        title: true,
        content: true,
        hitno: true,
        regdate: true
      }
    })
    
    if (!board) {
      return {
        success: false,
        error: '게시물을 찾을 수 없습니다.'
      }
    }
    
    // 이전 게시물
    const prev = await prisma.sunriseinfo_tbl_board.findFirst({
      where: {
        bno: {
          lt: id
        }
      },
      select: {
        bno: true,
        title: true
      },
      orderBy: {
        bno: 'desc'
      }
    })
    
    // 다음 게시물
    const next = await prisma.sunriseinfo_tbl_board.findFirst({
      where: {
        bno: {
          gt: id
        }
      },
      select: {
        bno: true,
        title: true
      },
      orderBy: {
        bno: 'asc'
      }
    })
    
    return {
      success: true,
      data: board,
      prev: prev || null,
      next: next || null
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})