import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { paths } from "@/routes/paths";
import { Home } from "@/pages/Home";
import { MapPage } from "@/pages/Map";
import { ParkingDetails } from "@/pages/ParkingDetails";
import { AddParking } from "@/pages/AddParking";
import { Bookings } from "@/pages/Bookings";
import { Profile } from "@/pages/Profile";
import { NotFound } from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: paths.home, element: <Home /> },
      { path: paths.map, element: <MapPage /> },
      { path: paths.parkingDetails(":id"), element: <ParkingDetails /> },
      { path: paths.addParking, element: <AddParking /> },
      { path: paths.bookings, element: <Bookings /> },
      { path: paths.profile, element: <Profile /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
