import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample courses
  const algebraCourse = await prisma.course.create({
    data: {
      title: 'Algebra Fundamentals',
      description: 'Master the basics of algebra with step-by-step explanations',
      category: 'Mathematics',
      grade: 'Grade 10',
      duration: 45,
      lessons: 12,
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    }
  })

  const biologyCourse = await prisma.course.create({
    data: {
      title: 'Biology: Cell Structure',
      description: 'Explore the fascinating world of cells and their components',
      category: 'Science',
      grade: 'Grade 10',
      duration: 35,
      lessons: 8,
      thumbnailUrl: 'https://img.youtube.com/vi/URUJD5NEXC8/maxresdefault.jpg'
    }
  })

  const physicsCourse = await prisma.course.create({
    data: {
      title: 'Physics: Motion & Forces',
      description: 'Understanding the principles of motion and forces in physics',
      category: 'Science',
      grade: 'Grade 10',
      duration: 50,
      lessons: 15,
      thumbnailUrl: 'https://img.youtube.com/vi/b240PGCMwV0/maxresdefault.jpg'
    }
  })

  const literatureCourse = await prisma.course.create({
    data: {
      title: 'English Literature',
      description: 'Dive into classic literature and improve your analysis skills',
      category: 'Languages',
      grade: 'Grade 10',
      duration: 40,
      lessons: 10,
      thumbnailUrl: 'https://img.youtube.com/vi/oHg5SJYRHA0/maxresdefault.jpg'
    }
  })

  // Create sample videos for each course
  const videos = [
    // Algebra videos
    {
      title: 'Introduction to Algebra',
      description: 'Basic concepts and fundamentals of algebra',
      duration: 900, // 15 minutes
      fileName: 'algebra-intro.mp4',
      filePath: '/videos/algebra-intro.mp4',
      mimeType: 'video/mp4',
      quality: '720p',
      fileSize: 52428800, // 50MB
      downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      courseId: algebraCourse.id
    },
    {
      title: 'Linear Equations',
      description: 'Solving linear equations step by step',
      duration: 1200, // 20 minutes
      fileName: 'linear-equations.mp4',
      filePath: '/videos/linear-equations.mp4',
      mimeType: 'video/mp4',
      quality: '720p',
      fileSize: 67108864, // 64MB
      downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      courseId: algebraCourse.id
    },
    // Biology videos
    {
      title: 'Cell Membrane Structure',
      description: 'Understanding cell membrane composition and function',
      duration: 800, // 13 minutes
      fileName: 'cell-membrane.mp4',
      filePath: '/videos/cell-membrane.mp4',
      mimeType: 'video/mp4',
      quality: '720p',
      fileSize: 45088768, // 43MB
      downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      courseId: biologyCourse.id
    },
    {
      title: 'Mitochondria and Energy Production',
      description: 'How cells produce energy through mitochondria',
      duration: 1050, // 17.5 minutes
      fileName: 'mitochondria.mp4',
      filePath: '/videos/mitochondria.mp4',
      mimeType: 'video/mp4',
      quality: '1080p',
      fileSize: 89478485, // 85MB
      downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      courseId: biologyCourse.id
    },
    // Physics videos
    {
      title: 'Newton\'s First Law of Motion',
      description: 'Understanding inertia and Newton\'s first law',
      duration: 720, // 12 minutes
      fileName: 'newton-first-law.mp4',
      filePath: '/videos/newton-first-law.mp4',
      mimeType: 'video/mp4',
      quality: '720p',
      fileSize: 41943040, // 40MB
      downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      courseId: physicsCourse.id
    },
    {
      title: 'Force and Acceleration',
      description: 'The relationship between force and acceleration',
      duration: 960, // 16 minutes
      fileName: 'force-acceleration.mp4',
      filePath: '/videos/force-acceleration.mp4',
      mimeType: 'video/mp4',
      quality: '1080p',
      fileSize: 73400320, // 70MB
      downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      courseId: physicsCourse.id
    },
    // Literature videos
    {
      title: 'Shakespeare\'s Romeo and Juliet',
      description: 'Analysis of themes in Romeo and Juliet',
      duration: 1080, // 18 minutes
      fileName: 'romeo-juliet.mp4',
      filePath: '/videos/romeo-juliet.mp4',
      mimeType: 'video/mp4',
      quality: '720p',
      fileSize: 56623104, // 54MB
      downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      courseId: literatureCourse.id
    },
    {
      title: 'Poetry Analysis Techniques',
      description: 'How to analyze poetry effectively',
      duration: 840, // 14 minutes
      fileName: 'poetry-analysis.mp4',
      filePath: '/videos/poetry-analysis.mp4',
      mimeType: 'video/mp4',
      quality: '720p',
      fileSize: 48234496, // 46MB
      downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      courseId: literatureCourse.id
    }
  ]

  // Create all videos
  for (const videoData of videos) {
    await prisma.video.create({
      data: videoData
    })
  }

  // Initialize storage info
  await prisma.offlineStorage.create({
    data: {
      totalSize: 0,
      usedSize: 0,
      videoCount: 0
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📚 Created ${videos.length} videos across 4 courses`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })