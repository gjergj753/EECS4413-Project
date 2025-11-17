import { useEffect } from 'react';
import React from 'react';
import {
  AppBar, Toolbar, CssBaseline, Drawer, IconButton, Typography,
  List, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Badge,
  Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from "../context/CartContext";
const drawerWidth = 240;

// simulating api call
function fetchGenres() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["Fiction", "Non-Fiction", "Sci-Fi", "History", "Fantasy", "Drama"]);
    }, 300);
  });
}

export default function Navbar({ isAdmin = false, isLoggedIn = false, onLogout }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [genres, setGenres] = React.useState([]);
  const [openGenres, setOpenGenres] = React.useState(false);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchGenres().then(setGenres); // simulate async fetch from DB
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleLogoutClick = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed && onLogout) onLogout(); navigate("/");
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <Typography variant="h6">BookStore</Typography>
      </Toolbar>
      <Divider />

      <List>
        <ListItemButton selected={location.pathname === '/'} onClick={() => navigate('/', { state: { reset: true } })}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        {/* GENRES COLLAPSIBLE SECTION */}
        <ListItemButton onClick={() => setOpenGenres(!openGenres)}>
          <ListItemIcon><MenuBookIcon /></ListItemIcon>
          <ListItemText primary="Genres" />
          {openGenres ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>

        <Collapse in={openGenres} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {genres.map((g) => (
              <ListItemButton
                key={g}
                sx={{ pl: 4 }}
                onClick={() => navigate(`/books?genre=${encodeURIComponent(g)}`)}
              >
                <ListItemText primary={g} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Account section */}
        {isLoggedIn ? (
          <>
            <ListItemButton onClick={() => navigate('/account')}>
              <ListItemIcon><AccountCircleIcon /></ListItemIcon>
              <ListItemText primary="My Account" />
            </ListItemButton>

            <ListItemButton onClick={() => navigate('/orders')}>
              <ListItemIcon><MenuBookIcon /></ListItemIcon>
              <ListItemText primary="My Orders" />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton onClick={() => navigate('/login')}>
            <ListItemIcon><LoginIcon /></ListItemIcon>
            <ListItemText primary="Login / Register" />
          </ListItemButton>
        )}

        {/* Cart */}
        <ListItemButton onClick={() => navigate('/cart')}>
          <ListItemIcon>
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="My Cart" />
        </ListItemButton>

        <Divider sx={{ my: 1 }} />

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <Typography variant="subtitle2" sx={{ px: 2, mt: 1, fontWeight: 500 }}>
              Admin
            </Typography>
            <ListItemButton onClick={() => navigate('/admin/inventory')}>
              <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
              <ListItemText primary="Manage Inventory" />
            </ListItemButton>

            <ListItemButton onClick={() => navigate('/admin/sales')}>
              <ListItemIcon><MenuBookIcon /></ListItemIcon>
              <ListItemText primary="Sales History" />
            </ListItemButton>
          </>
        )}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />

      {isLoggedIn && (
        <List>
          <ListItemButton onClick={handleLogoutClick}>
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#283593',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <MenuBookIcon sx={{ mr: 1 }} />
          <Typography variant="h6" noWrap>
            BookStore
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

