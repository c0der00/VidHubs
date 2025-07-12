import React, { useState, useEffect } from "react"
import {
  Home, Compass, PlaySquare, Clock, ThumbsUp, Flame, Music2,
  Gamepad2, Trophy, Film, Newspaper, Radio, Plus, Menu,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import axios from "axios"

// Sample nav data
const mainNavItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Compass, label: "Explore", to: "/explore" },
  { icon: PlaySquare, label: "Subscriptions", to: "/subscriptions" },
]
const libraryItems = [
  { icon: Clock, label: "History", to: "/watch-hisroty" },
  { icon: PlaySquare, label: "Your Videos", to: "/your-videos" },
  { icon: ThumbsUp, label: "Liked Videos", to: "/liked-videos" },
]
const exploreItems = [
  { icon: Flame, label: "Trending", to: "trending" },
  { icon: Music2, label: "Music", to: "song" },
  { icon: Gamepad2, label: "Gaming", to: "gaming" },
  { icon: Trophy, label: "Sports", to: "sports" },
  { icon: Film, label: "Movies", to: "movies" },
  { icon: Newspaper, label: "News", to: "news" },
  { icon: Radio, label: "Live", to: "live" },
]




function SidebarContent({ collapsed }) {
  const [subscriptions,setSubscriptions] = useState([]);
  const navigate = useNavigate();
   const { data } = useSelector(state => state.auth)
  
  const baseItem = `
    flex items-center gap-3 p-2 rounded
    hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]
    transition text-[var(--sidebar-foreground)]
  `
  const label = "text-sm"

  const handleSearch = async (to) => {
    try {
      const trimmed = to.trim();
      if (trimmed) {
        navigate(`/?query=${encodeURIComponent(trimmed)}`);
      }
    } catch (error) {
      console.error("search fail", error)
    }
  }

  const handelSubscriptions = async() => {
  try {
    const response = await axios.get(`/api/v1/sub/getsubscribedchannels/${data._id}`) 
    setSubscriptions(response.data?.data[0]?.channel)  
  } catch (error) {
    console.error("fail to fatch subscriptions",error)
  }
}

useEffect(() => {
    handelSubscriptions()
  },[])

  return (
    <div className="overflow-y-auto h-full px-2">
      <ul>
        {mainNavItems.map(({ icon: Icon, label: lbl, to }) => (
          <li key={lbl}>
            <Link to={to} className={baseItem}>
              <Icon className="w-5 h-5" />
              {!collapsed && <span className={label}>{lbl}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <hr className="my-3 border-[var(--sidebar-border)]" />

      <ul>
        {libraryItems.map(({ icon: Icon, label: lbl, to }) => (
          <li key={lbl}>
            <Link to={to} className={baseItem}>
              <Icon className="w-5 h-5" />
              {!collapsed && <span className={label}>{lbl}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <hr className="my-3 border-[var(--sidebar-border)]" />

        <ul>
          {subscriptions.map((s) => (
            <li key={s._id}>
              <Link to={`/c/${s.username}`} className={`${baseItem} w-full text-left`}>
                <img src={s.avatar} alt={s.username} className="w-5 h-5 rounded-full" />
                {!collapsed && <span className={label}>{s.username}</span>}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/channels" className={baseItem}>
              <Plus className="w-5 h-5" />
              {!collapsed && <span className={label}>Browse Channels</span>}
            </Link>
          </li>
        </ul>

      <hr className="my-3 border-[var(--sidebar-border)]" />

      <ul>
        {exploreItems.map((exploreItem) => (
          <li key={exploreItem.label}>
            <button onClick={() => handleSearch(exploreItem.to)} className={baseItem}>
              <exploreItem.icon className="w-5 h-5" />
              {!collapsed && <span className={label}>{exploreItem.label}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function YoutubeSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMobileOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <>
      <aside
        className={`
          relative z-30 top-0 h-full
          transition-all duration-300 ease-in-out
          bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)]
          shadow-lg
          ${mobileOpen ? "left-0 w-64" : "left-[-100%] w-0"}
          md:left-0
          ${collapsed ? "md:w-[70px]" : "md:w-64"}
        `}
      >
        <div className="hidden md:flex justify-end p-2 border-b border-[var(--sidebar-border)]">
          <button onClick={() => setCollapsed(!collapsed)}>
            <Menu className="w-5 h-5 text-[var(--sidebar-foreground)]" />
          </button>
        </div>
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}