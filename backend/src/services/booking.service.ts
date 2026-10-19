import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/AppError";

function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * POST /api/parking/:id/book
 *
 * Capacity is decremented with a conditional `updateMany` (`availableCapacity: { gt: 0 }`)
 * inside a transaction, rather than a plain read-then-write. Postgres
 * evaluates that WHERE clause atomically per row, so two concurrent
 * bookings can't both succeed against the last available slot — the
 * second one's updateMany matches zero rows and the whole transaction
 * throws before a booking row is created.
 */
export async function createBooking(parkingSpotId: string, userId: string, startTime: Date, endTime: Date) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.badRequest("userId does not reference an existing user");

  const spot = await prisma.parkingSpot.findUnique({ where: { id: parkingSpotId } });
  if (!spot) throw AppError.notFound("Parking spot not found");
  if (spot.status !== "ACTIVE") throw AppError.conflict("This parking spot isn't currently active");
  if (spot.availableCapacity === null) {
    throw AppError.conflict("This parking spot doesn't have capacity information yet");
  }

  const hours = hoursBetween(startTime, endTime);
  const amount = spot.pricePerHour ? Number(spot.pricePerHour) * hours : 0;

  return prisma.$transaction(async (tx) => {
    const capacityUpdate = await tx.parkingSpot.updateMany({
      where: { id: parkingSpotId, status: "ACTIVE", availableCapacity: { gt: 0 } },
      data: { availableCapacity: { decrement: 1 }, lastUpdated: new Date() },
    });

    if (capacityUpdate.count === 0) {
      throw AppError.conflict("No available capacity at this parking spot");
    }

    return tx.booking.create({
      data: {
        userId,
        parkingSpotId,
        startTime,
        endTime,
        amount: new Prisma.Decimal(amount.toFixed(2)),
        status: "CONFIRMED",
      },
      include: { parkingSpot: { select: { id: true, name: true, address: true, type: true, latitude: true, longitude: true } } },
    });
  });
}

/** GET /api/bookings — optionally scoped to a user via ?userId= (no auth/session yet). */
export async function listBookings(userId?: string) {
  return prisma.booking.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { parkingSpot: { select: { id: true, name: true, address: true, type: true, latitude: true, longitude: true } } },
  });
}

/** PUT /api/bookings/:id/cancel — restores exactly the one slot this booking held. */
export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw AppError.notFound("Booking not found");
  if (booking.status !== "CONFIRMED") {
    throw AppError.conflict(`Booking is already ${booking.status.toLowerCase()} and can't be cancelled`);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    await tx.parkingSpot.update({
      where: { id: booking.parkingSpotId },
      data: { availableCapacity: { increment: 1 }, lastUpdated: new Date() },
    });

    return updated;
  });
}
