import { Home, Map, PlusCircle, Ticket, User } from "lucide-react";
import { paths } from "@/routes/paths";

export interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
}

export const navItems: NavItem[] = [
  { label: "Home", path: paths.home, icon: Home },
  { label: "Map", path: paths.map, icon: Map },
  { label: "Add Parking", path: paths.addParking, icon: PlusCircle },
  { label: "Bookings", path: paths.bookings, icon: Ticket },
  { label: "Profile", path: paths.profile, icon: User },
];
