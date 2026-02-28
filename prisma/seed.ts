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
          { number: 1, par: 4, yardage: 412, handicap: 7 },
          { number: 2, par: 3, yardage: 178, handicap: 15 },
          { number: 3, par: 4, yardage: 389, handicap: 9 },
          { number: 4, par: 5, yardage: 562, handicap: 3 },
          { number: 5, par: 4, yardage: 421, handicap: 5 },
          { number: 6, par: 3, yardage: 165, handicap: 17 },
          { number: 7, par: 4, yardage: 445, handicap: 1 },
          { number: 8, par: 4, yardage: 401, handicap: 11 },
          { number: 9, par: 4, yardage: 426, handicap: 13 },
          // Back 9
          { number: 10, par: 4, yardage: 418, handicap: 8 },
          { number: 11, par: 3, yardage: 172, handicap: 18 },
          { number: 12, par: 4, yardage: 398, handicap: 10 },
          { number: 13, par: 5, yardage: 548, handicap: 4 },
          { number: 14, par: 4, yardage: 434, handicap: 6 },
          { number: 15, par: 3, yardage: 158, handicap: 16 },
          { number: 16, par: 4, yardage: 452, handicap: 2 },
          { number: 17, par: 4, yardage: 407, handicap: 12 },
          { number: 18, par: 4, yardage: 428, handicap: 14 },
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
        { number: 1, par: 4, yardage: 440, handicap: 5 },
        { number: 2, par: 4, yardage: 421, handicap: 9 },
        { number: 3, par: 3, yardage: 198, handicap: 17 },
        { number: 4, par: 5, yardage: 612, handicap: 1 },
        { number: 5, par: 4, yardage: 398, handicap: 13 },
        { number: 6, par: 3, yardage: 175, handicap: 15 },
        { number: 7, par: 4, yardage: 462, handicap: 3 },
        { number: 8, par: 4, yardage: 412, handicap: 11 },
        { number: 9, par: 4, yardage: 445, handicap: 7 },
        { number: 10, par: 4, yardage: 456, handicap: 8 },
        { number: 11, par: 3, yardage: 182, handicap: 18 },
        { number: 12, par: 4, yardage: 408, handicap: 10 },
        { number: 13, par: 5, yardage: 585, handicap: 2 },
        { number: 14, par: 4, yardage: 434, handicap: 6 },
        { number: 15, par: 3, yardage: 165, handicap: 16 },
        { number: 16, par: 4, yardage: 478, handicap: 4 },
        { number: 17, par: 4, yardage: 415, handicap: 12 },
        { number: 18, par: 4, yardage: 462, handicap: 14 },
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
        { number: 1, par: 4, yardage: 398, handicap: 9 },
        { number: 2, par: 4, yardage: 412, handicap: 5 },
        { number: 3, par: 3, yardage: 168, handicap: 17 },
        { number: 4, par: 5, yardage: 525, handicap: 7 },
        { number: 5, par: 4, yardage: 389, handicap: 11 },
        { number: 6, par: 3, yardage: 155, handicap: 15 },
        { number: 7, par: 4, yardage: 445, handicap: 1 },
        { number: 8, par: 4, yardage: 378, handicap: 13 },
        { number: 9, par: 4, yardage: 421, handicap: 3 },
        { number: 10, par: 4, yardage: 405, handicap: 8 },
        { number: 11, par: 3, yardage: 172, handicap: 18 },
        { number: 12, par: 4, yardage: 392, handicap: 10 },
        { number: 13, par: 5, yardage: 512, handicap: 4 },
        { number: 14, par: 4, yardage: 418, handicap: 6 },
        { number: 15, par: 3, yardage: 148, handicap: 16 },
        { number: 16, par: 4, yardage: 438, handicap: 2 },
        { number: 17, par: 4, yardage: 401, handicap: 12 },
        { number: 18, par: 4, yardage: 424, handicap: 14 },
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
        { number: 1, par: 4, yardage: 438, handicap: 5 },
        { number: 2, par: 4, yardage: 445, handicap: 9 },
        { number: 3, par: 4, yardage: 468, handicap: 1 },
        { number: 4, par: 3, yardage: 198, handicap: 17 },
        { number: 5, par: 5, yardage: 636, handicap: 7 },
        { number: 6, par: 4, yardage: 425, handicap: 13 },
        { number: 7, par: 3, yardage: 182, handicap: 15 },
        { number: 8, par: 4, yardage: 485, handicap: 3 },
        { number: 9, par: 4, yardage: 452, handicap: 11 },
        { number: 10, par: 4, yardage: 461, handicap: 8 },
        { number: 11, par: 4, yardage: 442, handicap: 10 },
        { number: 12, par: 3, yardage: 192, handicap: 18 },
        { number: 13, par: 5, yardage: 628, handicap: 2 },
        { number: 14, par: 4, yardage: 478, handicap: 6 },
        { number: 15, par: 3, yardage: 175, handicap: 16 },
        { number: 16, par: 4, yardage: 502, handicap: 4 },
        { number: 17, par: 4, yardage: 435, handicap: 12 },
        { number: 18, par: 5, yardage: 572, handicap: 14 },
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
          create: holes.map(h => ({
            number: h.number,
            par: h.par,
            yardage: h.yards,  // Map 'yards' to 'yardage'
            handicap: h.handicap
          }))
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
