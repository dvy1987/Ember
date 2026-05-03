import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  xmlns: 'http://www.w3.org/2000/svg',
});

export function FlameIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M10 17C12.7614 17 15 14.7614 15 12C15 9.23858 12.5 6 10 3C7.5 6 5 9.23858 5 12C5 14.7614 7.23858 17 10 17Z" />
      <path d="M10 17V10" />
    </svg>
  );
}

export function CircleDotIcon({ size = 12, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="10" cy="10" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BeginIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="10" cy="10" r="8" />
      <path d="M8 7L13 10L8 13V7Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClockIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6V10L13 13" />
    </svg>
  );
}

export function FeatherIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M15 5C15 5 12.5 4 9 7C5.5 10 4 15 4 15C4 15 8 15 11 12C14.5 8.5 15 5 15 5Z" />
      <path d="M10 10L6 14" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 10H16M16 10L11 5M16 10L11 15" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M16 10H4M4 10L9 5M4 10L9 15" />
    </svg>
  );
}

export function ArrowDownIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M10 4V16M10 16L5 11M10 16L15 11" />
    </svg>
  );
}

export function ArrowUpIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M10 16V4M10 4L5 9M10 4L15 9" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 12, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M7 4L13 10L7 16" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 12, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 7L10 13L16 7" />
    </svg>
  );
}

export function SettingsIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="10" cy="10" r="3" />
      <path d="M10 3V4M10 16V17M15 10H16M4 10H3M13.5 6.5L14.5 5.5M5.5 14.5L6.5 13.5M6.5 6.5L5.5 5.5M14.5 14.5L13.5 13.5" />
    </svg>
  );
}

export function InsightsIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 16V12M9 16V8M15 16V4" />
    </svg>
  );
}

export function PauseIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M7 5V15M13 5V15" />
    </svg>
  );
}

export function PlayIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M6 4L16 10L6 16V4Z" fill="currentColor" />
    </svg>
  );
}

export function CheckIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 10L8 14L16 6" strokeWidth="1.5" />
    </svg>
  );
}

export function CloseIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 5L15 15M15 5L5 15" />
    </svg>
  );
}

export function PlusIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M10 4V16M4 10H16" />
    </svg>
  );
}

export function MoonIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M16 11.5A6.5 6.5 0 1 1 8.5 4a5 5 0 0 0 7.5 7.5Z" />
    </svg>
  );
}

export function AlertIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M10 3L18 17H2L10 3Z" />
      <path d="M10 8V12M10 14.5V14.51" strokeWidth="1.5" />
    </svg>
  );
}

export function SparkIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M10 3L11.5 8.5L17 10L11.5 11.5L10 17L8.5 11.5L3 10L8.5 8.5L10 3Z" />
    </svg>
  );
}

export function LeafIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 16C4 16 4 8 10 4C16 4 16 10 12 14C9 17 4 16 4 16Z" />
      <path d="M4 16L10 10" />
    </svg>
  );
}

export function WindIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 8H13C14.6569 8 16 6.65685 16 5C16 3.34315 14.6569 2 13 2" />
      <path d="M3 12H15" />
      <path d="M3 16H11C12.6569 16 14 17.3431 14 19" />
    </svg>
  );
}

export function SnowflakeIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M10 2V18M2 10H18M4.5 4.5L15.5 15.5M15.5 4.5L4.5 15.5" />
      <path d="M10 5L8 7M10 5L12 7M10 15L8 13M10 15L12 13M5 10L7 8M5 10L7 12M15 10L13 8M15 10L13 12" strokeWidth="0.8" />
    </svg>
  );
}

export function ArchiveIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="2" y="4" width="16" height="4" rx="1" />
      <path d="M3 8V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V8" />
      <path d="M8 12H12" />
    </svg>
  );
}

export function EditIcon({ size = 14, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M14.5 3.5L16.5 5.5L6 16H4V14L14.5 3.5Z" />
      <path d="M13 5L15 7" />
    </svg>
  );
}
