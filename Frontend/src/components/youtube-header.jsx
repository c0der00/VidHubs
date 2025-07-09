"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Camera,
  Mic,
  Search,
  User,
  Youtube,
  Menu,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";

import newRequest from "../utils/newRequest";
import { logout } from "../redux/authSlice";
import DarkModeToggle from "./ui/DarkModeToggle";
import VoiceSearch from "./VoiceSearch";

export function YoutubeHeader() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const isLoading = auth?.isLoading;
  const [search,setSearch] = useState(null)

  useEffect(() => {
    if (auth?.data) {
      setUser(auth.data);
  } else {
    setUser(null); // Reset local user state on logout
  }
  },[auth.data?.user]);

  const handleLogout = async () => {
    try {
      console.log('lllllllllllllllllll');
      await newRequest.post(
        "/api/v1/users/logout",
        {},
        {
          withCredentials: true,
        }
      );
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleSearch = async() => {
    try {
      console.log(search);
      const trimmed = search.trim();
    if (trimmed) {
      navigate(`/?query=${encodeURIComponent(trimmed)}`);
    }
    } catch (error) {
      console.error("search fail",error)
    }
  }

  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4">
        {/* Logo & Sidebar */}
        <div className="flex items-center gap-4 md:w-48">
          <Link to="/" className="flex items-center gap-2">
            <Youtube className="size-6" />
            <span className="hidden font-semibold md:inline-block">
              VidHub
            </span>
          </Link>
        </div>

        {/* Search Desktop */}
        <div className="flex-1 justify-center hidden gap-2 px-4 md:flex">
          <div className="relative w-full max-w-[600px]">
            <Input
              type="search"
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
              className="w-full  rounded-full border bg-muted/50 focus:ring focus:ring-ring"
            />
            <Button
              type="submit"
              variant="secondary"
              size="icon"
              className="absolute right-0 top-0 h-full rounded-l-none rounded-r-full"
              onClick = {handleSearch}
            >
              <Search className="size-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
          <Button variant="ghost" size="icon">
            <VoiceSearch
              onVoiceResult={(text) => {
                setSearch(text);
                console.log(text);
                
                if (text && text.trim()) {
                  navigate(`/?query=${encodeURIComponent(text.trim())}`);
                }
              }}
            />
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="flex flex-1 justify-end gap-2 md:hidden">
          <Sheet>{console.log(auth?.data)}
            <SheetTrigger asChild>
              <Button type="submit" variant="ghost" size="icon">
                <Search className="size-5" />
                <span className="sr-only">Search</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full p-4">
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search"
                  className="flex-1 rounded-full border bg-muted/50 focus:ring focus:ring-ring"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button 
                type="submit" 
                variant="ghost" 
                size="icon"
                 onClick = {handleSearch}
                >
                <Search className="size-5" />
                <span className="sr-only">Search</span>
                </Button>
                <Button variant="ghost" size="icon" >
                  <Mic className="size-4" />
                  <span className="sr-only">Voice Search</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Camera className="size-5" />
            <span className="sr-only">Create</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="size-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DarkModeToggle/>

          {/* User Avatar */}
          {isLoading ? (
            <Avatar className="size-8">
              <AvatarFallback>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
              </AvatarFallback>
            </Avatar>
          ) : user ? (
            <DropdownMenu>
            
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.username}
                    />
                    <AvatarFallback>
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2 p-4">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.username}
                    />
                    <AvatarFallback>
                      <User className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{user.user?.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to={`/c/${user?.username}`}>
                  <DropdownMenuItem>Your Channel</DropdownMenuItem>
                </Link>
                <DropdownMenuItem>YouTube Studio</DropdownMenuItem>
                <DropdownMenuItem>Switch Account</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign Out
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button
                variant="ghost"
                size="icon"
                className="opacity-50 cursor-not-allowed"
              >
                <Avatar className="size-8">
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
