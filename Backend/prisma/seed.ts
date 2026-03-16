import "dotenv/config"
import { PrismaClient, WorkspaceRole, ProjectRole, IssuePriority } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { faker } from "@faker-js/faker"
import bcrypt from "bcrypt"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {

  console.log("🌱 Seeding database")

  await prisma.notification.deleteMany()
  await prisma.issueComment.deleteMany()
  await prisma.issueActivity.deleteMany()
  await prisma.issueDependency.deleteMany()
  await prisma.issue.deleteMany()
  await prisma.workflowTransition.deleteMany()
  await prisma.workflowState.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.workspaceMember.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash("Password@123", 10)

  /*
  USERS
  */

  const users = []

  for (let i = 0; i < 8; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.username(),
        name: faker.person.fullName(),
        passwordHash
      }
    })

    users.push(user)
  }

  const owner = users[0]

  /*
  WORKSPACE
  */

  const workspace = await prisma.workspace.create({
    data: {
      name: "Relay Demo Workspace"
    }
  })

  /*
  WORKSPACE MEMBERS
  */

  for (let i = 0; i < users.length; i++) {

    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: users[i].id,
        role:
          i === 0
            ? WorkspaceRole.OWNER
            : i === 1
            ? WorkspaceRole.ADMIN
            : WorkspaceRole.MEMBER
      }
    })

  }

  /*
  PROJECT
  */

  const project = await prisma.project.create({
    data: {
      name: "Relay Platform",
      key: "RLY",
      workspaceId: workspace.id
    }
  })

  /*
  PROJECT MEMBERS
  */

  for (let i = 0; i < users.length; i++) {

    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: users[i].id,
        role:
          i === 0
            ? ProjectRole.OWNER
            : i === 1
            ? ProjectRole.ADMIN
            : ProjectRole.MEMBER
      }
    })

  }

  /*
  WORKFLOW STATES
  */

  const open = await prisma.workflowState.create({
    data: { name: "OPEN", order: 1, projectId: project.id }
  })

  const inProgress = await prisma.workflowState.create({
    data: { name: "IN_PROGRESS", order: 2, projectId: project.id }
  })

  const review = await prisma.workflowState.create({
    data: { name: "REVIEW", order: 3, projectId: project.id }
  })

  const done = await prisma.workflowState.create({
    data: { name: "DONE", order: 4, projectId: project.id }
  })

  const blocked = await prisma.workflowState.create({
    data: { name: "BLOCKED", order: 5, projectId: project.id }
  })

  const states = [open, inProgress, review, done, blocked]

  /*
  WORKFLOW TRANSITIONS
  */

  const transitions: [typeof open, typeof open, ProjectRole][] = [
    [open, inProgress, ProjectRole.MEMBER],
    [inProgress, review, ProjectRole.MEMBER],
    [review, done, ProjectRole.MEMBER],
    [review, inProgress, ProjectRole.MEMBER],
    [inProgress, blocked, ProjectRole.MEMBER],
    [blocked, inProgress, ProjectRole.ADMIN]
  ]

  for (const [from, to, allowedRoles] of transitions) {

    await prisma.workflowTransition.create({
      data: {
        projectId: project.id,
        fromStateId: from.id,
        toStateId: to.id,
        allowedRoles
      }
    })

  }

  /*
  ISSUES
  */

  const issues = []

  const priorities = [
    IssuePriority.LOW,
    IssuePriority.MEDIUM,
    IssuePriority.HIGH
  ]

  for (let i = 0; i < 100; i++) {

    const state = faker.helpers.arrayElement(states)
    const assignee = faker.helpers.arrayElement(users)

    const issue = await prisma.issue.create({
      data: {
        key: `RLY-${i + 1}`,
        title: faker.hacker.phrase(),
        description: faker.lorem.paragraph(),
        projectId: project.id,
        reporterId: owner.id,
        assigneeId: assignee.id,
        priority: faker.helpers.arrayElement(priorities),
        stateId: state.id
      }
    })

    issues.push(issue)

  }

  /*
  COMMENTS
  */

  for (const issue of issues) {

    const commentCount = faker.number.int({ min: 0, max: 4 })

    for (let i = 0; i < commentCount; i++) {

      const user = faker.helpers.arrayElement(users)

      await prisma.issueComment.create({
        data: {
          issueId: issue.id,
          userId: user.id,
          content: faker.lorem.sentence()
        }
      })

    }

  }

  /*
  DEPENDENCIES
  */

  const usedPairs = new Set<string>()

  for (let i = 0; i < 20; i++) {

    const blocker = faker.helpers.arrayElement(issues)
    const blockedIssue = faker.helpers.arrayElement(issues)
    const pairKey = `${blocker.id}-${blockedIssue.id}`

    if (blocker.id !== blockedIssue.id && !usedPairs.has(pairKey)) {
      usedPairs.add(pairKey)

      await prisma.issueDependency.create({
        data: {
          blockerId: blocker.id,
          blockedId: blockedIssue.id
        }
      })

    }

  }

  /*
  WHITEBOARD
  */

  await prisma.projectBoard.create({
    data: {
      projectId: project.id,
      strokes: []
    }
  })

  console.log("✅ Seed completed with large dataset")
  console.log(`   Users: ${users.length}`)
  console.log(`   Owner: ${owner.email} / password123`)
  console.log(`   Issues: ${issues.length}`)

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
