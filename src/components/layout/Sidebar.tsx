import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  Box,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import MapIcon from "@mui/icons-material/Map";
import InventoryIcon from "@mui/icons-material/Inventory";
import FactoryIcon from "@mui/icons-material/Factory";
import StoreIcon from "@mui/icons-material/Store";
import PaymentsIcon from "@mui/icons-material/Payments";
import SellIcon from "@mui/icons-material/Sell";
import GroupIcon from "@mui/icons-material/Group";
import WarningIcon from "@mui/icons-material/Warning";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";

const drawerWidth = 240;
const collapsedWidth = 70;

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/", roles: ["admin", "salesman"] },
  { text: "User Management", icon: <PeopleIcon />, path: "/users", roles: ["admin"] },
  { text: "Route Management", icon: <MapIcon />, path: "/routes", roles: ["admin"] },
  { text: "Item Management", icon: <InventoryIcon />, path: "/items", roles: ["admin"] },
  { text: "Production Batch", icon: <FactoryIcon />, path: "/production", roles: ["admin"] },
  { text: "Store", icon: <StoreIcon />, path: "/store", roles: ["admin"] },
  { text: "Expenses", icon: <PaymentsIcon />, path: "/expenses", roles: ["admin"] },
  { text: "Customers", icon: <GroupIcon />, path: "/customers", roles: ["admin", "salesman"] },
  { text: "Sales Entry", icon: <SellIcon />, path: "/sales-entry", roles: ["admin", "salesman"] },
  { text: "Payments", icon: <PaymentsIcon />, path: "/payments", roles: ["salesman"] },
  { text: "My Routes", icon: <MapIcon />, path: "/my-routes", roles: ["salesman"] },
  { text: "Salary", icon: <AccountBalanceWalletIcon />, path: "/salary", roles: ["admin"] },
  { text: "Accounts", icon: <ReceiptIcon />, path: "/accounts", roles: ["admin"] },
  { text: "Expiry Alerts", icon: <WarningIcon />, path: "/expiry", roles: ["admin"] },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const { user } = useAuthStore();

  const visibleItems = menuItems.filter((item) => user?.role && item.roles.includes(user.role));

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? drawerWidth : collapsedWidth,
          transition: "width 0.3s",
          overflowX: "hidden",
          boxSizing: "border-box",
          backgroundColor: "#0f172a",
          color: "#fff",
        },
      }}
    >
      <Toolbar />
      <Toolbar sx={{ display: "flex", justifyContent: open ? "space-between" : "center" }}>
        {open && <Box fontWeight="bold">ERP System</Box>}
        <IconButton onClick={() => setOpen(!open)} sx={{ color: "#fff" }}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      <List>
        {visibleItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  backgroundColor: active ? "#2563eb" : "transparent",
                  "&:hover": { backgroundColor: "#334155" },
                }}
              >
                <ListItemIcon sx={{ color: "#fff", minWidth: 0, mr: open ? 2 : "auto" }}>
                  {item.icon}
                </ListItemIcon>
                {open && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}