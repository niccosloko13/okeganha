import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props} />;
}

export const HomeIcon = (props: IconProps) => <BaseIcon {...props}><path d="M3 11.5 12 4l9 7.5M6.5 10.5V20h11V10.5" /></BaseIcon>;
export const MissionsIcon = (props: IconProps) => <BaseIcon {...props}><path d="M6 4h12v16H6zM9 9h6M9 13h6M9 17h4" /></BaseIcon>;
export const ChestIcon = (props: IconProps) => <BaseIcon {...props}><path d="M4 9h16v10H4zM4 9V7h16v2M9 13h6" /></BaseIcon>;
export const WalletIcon = (props: IconProps) => <BaseIcon {...props}><path d="M4 8h16v10H4zM4 8V6h12v2M20 13h-4" /></BaseIcon>;
export const ProfileIcon = (props: IconProps) => <BaseIcon {...props}><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" /></BaseIcon>;
export const SocialIcon = (props: IconProps) => <BaseIcon {...props}><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM10.5 9.5l3 5" /></BaseIcon>;
export const LogoutIcon = (props: IconProps) => <BaseIcon {...props}><path d="M9 4H5v16h4M14 8l5 4-5 4M19 12H9" /></BaseIcon>;
export const InstagramIcon = (props: IconProps) => <BaseIcon {...props}><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.2" /><circle cx="17" cy="7" r="1" fill="currentColor" /></BaseIcon>;
export const TikTokIcon = (props: IconProps) => <BaseIcon {...props}><path d="M13 6v7.2a3.2 3.2 0 1 1-2.3-3.1" /><path d="M13 7c.9 1.3 2.1 2 3.8 2.2" /></BaseIcon>;
export const FacebookIcon = (props: IconProps) => <BaseIcon {...props}><path d="M14.5 7.5h-1.3c-1 0-1.2.5-1.2 1.2V10h2.4l-.3 2.4H12v6.1H9.5v-6.1H8V10h1.5V8.4c0-2 1.2-3.1 3-3.1 1 0 2 .1 2 .1z" /></BaseIcon>;
