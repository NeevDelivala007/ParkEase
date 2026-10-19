export const paths = {
  home: "/",
  map: "/map",
  parkingDetails: (id: string) => `/parking/${id}`,
  addParking: "/add-parking",
  bookings: "/bookings",
  profile: "/profile",
} as const;
