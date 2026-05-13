type IconProps = { className?: string };

function Base({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-5 w-5"} aria-hidden>
      <defs>
        <linearGradient id="relaIconGrad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#5aa0ff" />
          <stop offset="55%" stopColor="#47c6ff" />
          <stop offset="100%" stopColor="#7c6dff" />
        </linearGradient>
      </defs>
      <g stroke="url(#relaIconGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

export const RelaIconDashboard = ({ className }: IconProps) => <Base className={className}><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="5" /><rect x="13" y="10" width="8" height="11" /><rect x="3" y="13" width="8" height="8" /></Base>;
export const RelaIconCampaigns = ({ className }: IconProps) => <Base className={className}><path d="M4 8h16" /><path d="M4 12h12" /><path d="M4 16h8" /><rect x="3" y="4" width="18" height="16" rx="2" /></Base>;
export const RelaIconPlus = ({ className }: IconProps) => <Base className={className}><path d="M12 5v14" /><path d="M5 12h14" /></Base>;
export const RelaIconReports = ({ className }: IconProps) => <Base className={className}><path d="M6 18V9" /><path d="M12 18V6" /><path d="M18 18v-4" /><path d="M4 20h16" /></Base>;
export const RelaIconFinance = ({ className }: IconProps) => <Base className={className}><circle cx="12" cy="12" r="8" /><path d="M9 10.5c0-1 1.3-1.7 3-1.5 1.4.2 2.5 1 2.5 2" /><path d="M15 13.5c0 1-1.2 1.8-2.8 1.7-1.5-.1-2.7-1-2.7-2.2" /></Base>;
export const RelaIconSettings = ({ className }: IconProps) => <Base className={className}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4.8a7.7 7.7 0 0 0-1.7-1L14.5 3h-5L9.2 5.8c-.6.2-1.2.6-1.8 1l-2.4-.8-2 3.5L5 11c0 .3-.1.7-.1 1s0 .7.1 1l-2 1.5 2 3.5 2.4-.8c.6.4 1.2.8 1.8 1l.3 2.8h5l.3-2.8c.5-.2 1.1-.6 1.7-1l2.4.8 2-3.5-2-1.5c.1-.3.1-.7.1-1Z" /></Base>;
export const RelaIconSupport = ({ className }: IconProps) => <Base className={className}><circle cx="12" cy="11" r="7" /><path d="M9.6 9.4a2.4 2.4 0 1 1 4.8 0c0 1.8-2.4 2-2.4 3.6" /><path d="M12 16.8h.01" /></Base>;
export const RelaIconLogout = ({ className }: IconProps) => <Base className={className}><path d="M15 8l4 4-4 4" /><path d="M8 12h11" /><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" /></Base>;
export const RelaIconTokens = ({ className }: IconProps) => <Base className={className}><ellipse cx="12" cy="7" rx="6" ry="3" /><path d="M6 7v6c0 1.7 2.7 3 6 3s6-1.3 6-3V7" /></Base>;
export const RelaIconPerformance = ({ className }: IconProps) => <Base className={className}><path d="M4 18l5-5 3 3 8-8" /><path d="M20 13V8h-5" /></Base>;
