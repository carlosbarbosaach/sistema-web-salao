import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      {children}
    </aside>
  );
}

export function CardHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 rounded-t-3xl">
      <h3 className="text-sm font-medium text-slate-700">{title}</h3>
      <div className="text-xs text-slate-500">{right}</div>
    </header>
  );
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}

export function SubBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden">
      {children}
    </div>
  );
}
