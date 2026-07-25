import logo from '../assets/LeetLens_logo.png'
import { useContext, useState, useEffect } from "react";
import { NavLink, useLocation } from 'react-router-dom';
import { User_nameContext } from "../routs/CreateContext";
import {
  FiBarChart2,
  FiGithub,
  FiGrid,
  FiLinkedin,
  FiSettings,
  FiTarget,
  FiTwitter,
  FiUser,
  FiEdit3,
} from "react-icons/fi";
import { GiScrollUnfurled } from "react-icons/gi";

const menuItems = [
  { label: "Dashboard", icon: FiGrid,link:'/' },
  { label: "Profile", icon: FiUser,link:'/bar' },
  { label: "Admin", icon: FiEdit3, link: '/admin' },
  { label: "Problems", icon: FiTarget,link:'/problems' },
  // { label: "Skill Analysis", icon: FiBarChart2,link:'/Analysis' },
  { label: "Feed", icon: GiScrollUnfurled ,link:'/feed'},
];


const MenuIcon = ({ active = false, Icon }) => (
  <span
    className={`grid h-5 w-5 place-items-center rounded-md border ${active ? "border-emerald-400/80 text-emerald-300" : "border-slate-500/70 text-slate-300"
      }`}
  >
    <Icon size={13} />
  </span>
);

const SocialIcon = ({ label, Icon }) => (
  <button
    type="button"
    className="grid h-10 w-10 place-items-center rounded-full bg-slate-900/80 text-slate-300 transition hover:text-emerald-300"
    aria-label={label}
  >
    <Icon size={18} />
  </button>
);

const Sightbar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { submittedUsername } = useContext(User_nameContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasValidUsername = Boolean(submittedUsername?.trim());
  const visibleMenuItems = hasValidUsername
    ? menuItems
    : menuItems.filter((item) => item.label === "Dashboard");

  useEffect(() => {
    const idx = visibleMenuItems.findIndex((m) => m.link === location.pathname);
    if (idx >= 0) setActiveIndex(idx);
    else setActiveIndex(0);
  }, [location.pathname, visibleMenuItems]);

  const button_active = (index) => {
    setActiveIndex(index);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/60 transition-opacity md:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 h-screen max-h-screen w-[85vw] max-w-70 min-w-63.75 overflow-hidden border-r-2 border-slate-700 bg-slate-950 px-5 py-4 text-slate-100 transition-transform sm:px-6 md:static md:z-auto md:w-full md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
      <div className="pointer-events-none absolute inset-0 bg-slate-950" />

      <div className="relative flex h-full flex-col ">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">

            <img src={logo} alt="" className=" h-10 w-10 " />
            <h1 className="text-3xl font-semibold tracking-tight">
              <span className="text-slate-100">Leet</span>
              <span className="text-emerald-400">Lens</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 text-slate-300 transition hover:bg-slate-800 md:hidden"
            aria-label="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="m18 6-12 12" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1.5">
          {visibleMenuItems.map(({ label, icon, link }, index) => {
            const active = activeIndex === index;
            
            return (
              <NavLink to={link}
                
                key={label}
                onClick={() => {
                  button_active(index);
                  onClose?.();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-base transition ${active
                    ? "bg-linear-to-r from-emerald-500/15 to-blue-500/10 text-emerald-300  border-r-emerald-400/35"
                    : "text-slate-200 hover:bg-slate-800/60"
                  }`}
              >
                <MenuIcon active={active} Icon={icon} />
                <span className="font-medium">{label}</span>
              </NavLink>
            );
          })}
        </nav>
        {!hasValidUsername && (
          <p className="mt-3 rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
            Enter a valid LeetCode username to unlock more menu options.
          </p>
        )}

        <div className="mt-auto rounded-xl border border-slate-700/70 bg-linear-to-br from-slate-900/95 to-blue-950/80 px-4 py-2 shadow-lg shadow-black/25">
          <p className="text-base leading-6 text-slate-100">
            Track. Analyze. Improve.
            <br />
            Your coding journey starts here.
          </p>
          <div className="mt-6 h-22 rounded-xl border border-emerald-400/25 bg-[linear-gradient(180deg,rgba(16,185,129,0.2),rgba(16,185,129,0.04))]" />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <SocialIcon label="GitHub" Icon={FiGithub} />
          <SocialIcon label="Twitter" Icon={FiTwitter} />
          <SocialIcon label="LinkedIn" Icon={FiLinkedin} />
          <SocialIcon label="Theme" Icon={FiSettings} />
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sightbar;