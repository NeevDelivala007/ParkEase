import { ParkingVerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/AppError";
import { COMMUNITY_VERIFICATION_THRESHOLD } from "@/config/constants";
import { reportReasonLabels, type CreateParkingSpotInput, type ReportParkingSpotInput } from "@/validators/parking.validators";

async function getSpotOrThrow(id: string) {
  const spot = await prisma.parkingSpot.findUnique({ where: { id } });
  if (!spot) throw AppError.notFound("Parking spot not found");
  return spot;
}

async function assertUserExists(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.badRequest("userId does not reference an existing user");
}

/** GET /api/parking — list, with verify/report counts computed in one extra query (no N+1). */
export async function listParkingSpots() {
  const [spots, counts] = await Promise.all([
    prisma.parkingSpot.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true },
    }),
    prisma.verification.groupBy({
      by: ["parkingSpotId", "type"],
      _count: { _all: true },
    }),
  ]);

  const countMap = new Map<string, { verifyCount: number; reportCount: number }>();
  for (const row of counts) {
    const entry = countMap.get(row.parkingSpotId) ?? { verifyCount: 0, reportCount: 0 };
    if (row.type === "VERIFY") entry.verifyCount = row._count._all;
    else entry.reportCount = row._count._all;
    countMap.set(row.parkingSpotId, entry);
  }

  return spots.map((spot) => ({
    ...spot,
    verifyCount: countMap.get(spot.id)?.verifyCount ?? 0,
    reportCount: countMap.get(spot.id)?.reportCount ?? 0,
  }));
}

/** GET /api/parking/:id */
export async function getParkingSpotById(id: string) {
  const spot = await prisma.parkingSpot.findUnique({
    where: { id },
    include: {
      images: true,
      verifications: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
  if (!spot) throw AppError.notFound("Parking spot not found");

  const verifyCount = spot.verifications.filter((v) => v.type === "VERIFY").length;
  const reportCount = spot.verifications.filter((v) => v.type === "REPORT").length;

  return { ...spot, verifyCount, reportCount };
}

/**
 * POST /api/parking
 *
 * `verificationStatus` is deliberately NOT accepted from the client — it
 * isn't part of CreateParkingSpotInput at all, so even if a request body
 * includes it, Zod strips it silently. The backend alone decides it here.
 */
export async function createParkingSpot(input: CreateParkingSpotInput, imageUrls: string[]) {
  if (input.submittedById) {
    await assertUserExists(input.submittedById);
  }

  const verificationStatus: ParkingVerificationStatus =
    input.type === "COMMUNITY" ? "COMMUNITY_SUBMITTED" : "UNDER_REVIEW";

  return prisma.parkingSpot.create({
    data: {
      name: input.name,
      description: input.description,
      type: input.type,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address,
      totalCapacity: input.totalCapacity,
      availableCapacity: input.availableCapacity ?? input.totalCapacity,
      pricePerHour: input.pricePerHour,
      openingTime: input.openingTime,
      closingTime: input.closingTime,
      verificationStatus,
      submittedById: input.submittedById,
      lastUpdated: new Date(),
      images: imageUrls.length
        ? { create: imageUrls.map((imageUrl) => ({ imageUrl, uploadedById: input.submittedById })) }
        : undefined,
    },
    include: { images: true },
  });
}

/** Re-checks the promotion threshold after a new VERIFY/REPORT is recorded. */
async function recomputeVerificationStatus(spot: { id: string; type: string; verificationStatus: string }) {
  const [verifyCount, reportCount] = await Promise.all([
    prisma.verification.count({ where: { parkingSpotId: spot.id, type: "VERIFY" } }),
    prisma.verification.count({ where: { parkingSpotId: spot.id, type: "REPORT" } }),
  ]);

  let verificationStatus = spot.verificationStatus as ParkingVerificationStatus;

  // "No unresolved serious report" is simplified, at this lean stage, to
  // "zero reports recorded" — there's no report-resolution workflow yet.
  const shouldPromote =
    spot.type === "COMMUNITY" &&
    verificationStatus === "COMMUNITY_SUBMITTED" &&
    verifyCount >= COMMUNITY_VERIFICATION_THRESHOLD &&
    reportCount === 0;

  if (shouldPromote) {
    const updated = await prisma.parkingSpot.update({
      where: { id: spot.id },
      data: { verificationStatus: "COMMUNITY_VERIFIED" },
    });
    verificationStatus = updated.verificationStatus;
  }

  return { verifyCount, reportCount, verificationStatus };
}

/** POST /api/parking/:id/verify */
export async function verifyParkingSpot(parkingSpotId: string, userId: string, comment?: string) {
  const spot = await getSpotOrThrow(parkingSpotId);
  await assertUserExists(userId);

  const existing = await prisma.verification.findUnique({
    where: { parkingSpotId_userId_type: { parkingSpotId, userId, type: "VERIFY" } },
  });
  if (existing) {
    throw AppError.conflict("You've already verified this parking spot");
  }

  await prisma.verification.create({
    data: { parkingSpotId, userId, type: "VERIFY", comment },
  });

  return recomputeVerificationStatus(spot);
}

/** POST /api/parking/:id/report */
export async function reportParkingSpot(
  parkingSpotId: string,
  userId: string,
  reason: ReportParkingSpotInput["reason"],
  comment?: string
) {
  const spot = await getSpotOrThrow(parkingSpotId);
  await assertUserExists(userId);

  const existing = await prisma.verification.findUnique({
    where: { parkingSpotId_userId_type: { parkingSpotId, userId, type: "REPORT" } },
  });
  if (existing) {
    throw AppError.conflict("You've already reported this parking spot");
  }

  const storedComment = comment ? `${reportReasonLabels[reason]} — ${comment}` : reportReasonLabels[reason];

  await prisma.verification.create({
    data: { parkingSpotId, userId, type: "REPORT", comment: storedComment },
  });

  // A report never auto-promotes; it only ever affects the counts here.
  const [verifyCount, reportCount] = await Promise.all([
    prisma.verification.count({ where: { parkingSpotId, type: "VERIFY" } }),
    prisma.verification.count({ where: { parkingSpotId, type: "REPORT" } }),
  ]);

  return { verifyCount, reportCount, verificationStatus: spot.verificationStatus };
}

/** GET /api/parking/:id/verifications */
export async function listVerifications(parkingSpotId: string) {
  const spot = await getSpotOrThrow(parkingSpotId);

  const verifications = await prisma.verification.findMany({
    where: { parkingSpotId },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });

  const verifyCount = verifications.filter((v) => v.type === "VERIFY").length;
  const reportCount = verifications.filter((v) => v.type === "REPORT").length;

  return { verifications, verifyCount, reportCount, verificationStatus: spot.verificationStatus };
}
