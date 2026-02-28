import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // White Eagle Golf Club - Naperville, IL
  // 18-hole championship course
  const whiteEagle = await prisma.course.create({
    data: {
      name: 'White Eagle Golf Club',
      city: 'Naperville',
      state: 'IL',
      country: 'USA',
      par: 72,
      totalYards: 7012,
      slope: 135,
      rating: 74.2,
      holes: {
        create: [
          // Front 9
          { number: 1, par: 4, yards: 412, handicap: 7 },
          { number: 2, par: 3, yards: 178, handicap: 15 },
          { number: 3, par: 4, yards: 389, handicap: 9 },
          { number: 4, par: 5, yards: 562, handicap: 3 },
          { number: 5, par: 4, yards: 421, handicap: 5 },
          { number: 6, par: 3, yards: 165, handicap: 17 },
          { number: 7, par: 4, yards: 445, handicap: 1 },
          { number: 8, par: 4, yards: 401, handicap: 11 },
          { number: 9, par: 4, yards: 426, handicap: 13 },
          // Back 9
          { number: 10, par: 4, yards: 418, handicap: 8 },
          { number: 11, par: 3, yards: 172, handicap: 18 },
          { number: 12, par: 4, yards: 398, handicap: 10 },
          { number: 13, par: 5, yards: 548, handicap: 4 },
          { number: 14, par: 4, yards: 434, handicap: 6 },
          { number: 15, par: 3, yards: 158, handicap: 16 },
          { number: 16, par: 4, yards: 452, handicap: 2 },
          { number: 17, par: 4, yards: 407, handicap: 12 },
          { number: 18, par: 4, yards: 428, handicap: 14 },
        ]
      }
    },
    include: {
      holes: true
    }
  })

  console.log(`Created course: ${whiteEagle.name}`)
  console.log(`  - ${whiteEagle.holes.length} holes`)
  console.log(`  - Par ${whiteEagle.par}`)
  console.log(`  - ${whiteEagle.totalYards} yards`)

  // Additional sample courses for variety
  const courses = [
    {
      name: 'Cog Hill - Dubsdread',
      city: 'Lemont',
      state: 'IL',
      par: 72,
      totalYards: 7243,
      slope: 142,
      rating: 75.8,
      holes: [
        { number: 1, par: 4, yards: 440, handicap: 5 },
        { number: 2, par: 4, yards: 421, handicap: 9 },
        { number: 3, par: 3, yards: 198, handicap: 17 },
        { number: 4, par: 5, yards: 612, handicap: 1 },
        { number: 5, par: 4, yards: 398, handicap: 13 },
        { number: 6, par: 3, yards: 175, handicap: 15 },
        { number: 7, par: 4, yards: 462, handicap: 3 },
        { number: 8, par: 4, yards: 412, handicap: 11 },
        { number: 9, par: 4, yards: 445, handicap: 7 },
        { number: 10, par: 4, yards: 456, handicap: 8 },
        { number: 11, par: 3, yards: 182, handicap: 18 },
        { number: 12, par: 4, yards: 408, handicap: 10 },
        { number: 13, par: 5, yards: 585, handicap: 2 },
        { number: 14, par: 4, yards: 434, handicap: 6 },
        { number: 15, par: 3, yards: 165, handicap: 16 },
        { number: 16, par: 4, yards: 478, handicap: 4 },
        { number: 17, par: 4, yards: 415, handicap: 12 },
        { number: 18, par: 4, yards: 462, handicap: 14 },
      ]
    },
    {
      name: 'Cantigny Golf',
      city: 'Wheaton',
      state: 'IL',
      par: 71,
      totalYards: 6789,
      slope: 132,
      rating: 73.4,
      holes: [
        { number: 1, par: 4, yards: 398, handicap: 9 },
        { number: 2, par: 4, yards: 412, handicap: 5 },
        { number: 3, par: 3, yards: 168, handicap: 17 },
        { number: 4, par: 5, yards: 525, handicap: 7 },
        { number: 5, par: 4, yards: 389, handicap: 11 },
        { number: 6, par: 3, yards: 155, handicap: 15 },
        { number: 7, par: 4, yards: 445, handicap: 1 },
        { number: 8, par: 4, yards: 378, handicap: 13 },
        { number: 9, par: 4, yards: 421, handicap: 3 },
        { number: 10, par: 4, yards: 405, handicap: 8 },
        { number: 11, par: 3, yards: 172, handicap: 18 },
        { number: 12, par: 4, yards: 392, handicap: 10 },
        { number: 13, par: 5, yards: 512, handicap: 4 },
        { number: 14, par: 4, yards: 418, handicap: 6 },
        { number: 15, par: 3, yards: 148, handicap: 16 },
        { number: 16, par: 4, yards: 438, handicap: 2 },
        { number: 17, par: 4, yards: 401, handicap: 12 },
        { number: 18, par: 4, yards: 424, handicap: 14 },
      ]
    },
    {
      name: 'Medinah Country Club - Course No. 3',
      city: 'Medinah',
      state: 'IL',
      par: 72,
      totalYards: 7562,
      slope: 147,
      rating: 77.2,
      holes: [
        { number: 1, par: 4, yards: 438, handicap: 5 },
        { number: 2, par: 4, yards: 445, handicap: 9 },
        { number: 3, par: 4, yards: 468, handicap: 1 },
        { number: 4, par: 3, yards: 198, handicap: 17 },
        { number: 5, par: 5, yards: 636, handicap: 7 },
        { number: 6, par: 4, yards: 425, handicap: 13 },
        { number: 7, par: 3, yards: 182, handicap: 15 },
        { number: 8, par: 4, yards: 485, handicap: 3 },
        { number: 9, par: 4, yards: 452, handicap: 11 },
        { number: 10, par: 4, yards: 461, handicap: 8 },
        { number: 11, par: 4, yards: 442, handicap: 10 },
        { number: 12, par: 3, yards: 192, handicap: 18 },
        { number: 13, par: 5, yards: 628, handicap: 2 },
        { number: 14, par: 4, yards: 478, handicap: 6 },
        { number: 15, par: 3, yards: 175, handicap: 16 },
        { number: 16, par: 4, yards: 502, handicap: 4 },
        { number: 17, par: 4, yards: 435, handicap: 12 },
        { number: 18, par: 5, yards: 572, handicap: 14 },
      ]
    }
  ]

  for (const courseData of courses) {
    const { holes, ...courseInfo } = courseData
    const course = await prisma.course.create({
      data: {
        ...courseInfo,
        country: 'USA',
        holes: {
          create: holes
        }
      },
      include: {
        holes: true
      }
    })
    console.log(`Created course: ${course.name}`)
  }

  console.log('\nSeeding finished.')
  console.log('Created 4 courses with full hole data.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
