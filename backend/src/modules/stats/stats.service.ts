import { prisma } from '../../lib/prisma';

export async function getGlobalStats() {
  const [totalUsers, totalInvestigations, threatsDetected] = await Promise.all([
    prisma.user.count(),
    prisma.investigation.count(),
    prisma.investigation.count({ where: { riskLevel: { in: ['HIGH', 'CRITICAL'] } } }),
  ]);

  return { totalUsers, totalInvestigations, threatsDetected };
}