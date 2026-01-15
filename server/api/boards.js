import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const offset = (page - 1) * limit
    
    // 전체 게시글 수 조회
    const totalCount = await prisma.sunriseinfo_tbl_board.count()
    
    // 페이지별 데이터 조회
    const rows = await prisma.sunriseinfo_tbl_board.findMany({
      select: {
        bno: true,
        userid: true,
        writer: true,
        title: true,
        hitno: true,
        regdate: true
      },
      orderBy: {
        bno: 'desc'
      },
      skip: offset,
      take: limit
    })
    
    // rownum 계산
    const dataWithRownum = rows.map((row, index) => ({
      ...row,
      rownum: totalCount - offset - index
    }))
    
    return {
      success: true,
      data: dataWithRownum,
      pagination: {
        currentPage: page,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        limit: limit
      }
    }
  } catch (error) {
    console.error('Database error:', error)
    return {
      success: false,
      error: error.message
    }
  }
})