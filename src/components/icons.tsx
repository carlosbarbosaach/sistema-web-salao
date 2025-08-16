// src/components/icons.tsx
export function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
  </svg>);
}
export function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
  </svg>);
}
export function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 8h2v7h-2v-7zm4 0h2v7h-2v-7zM7 11h2v7H7v-7z"/>
  </svg>);
}
