import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
};

export function Card({ children }: CardProps) {
  return (
    <div className="card-premium p-4">{children}</div>
  );
}

export function CardHeader({ children }: CardProps) {
  return <div className="mb-3">{children}</div>;
}

export function CardTitle({ children }: CardProps) {
  return <h2 className="font-semibold text-lg text-[var(--text-main)]">{children}</h2>;
}

export function CardContent({ children }: CardProps) {
  return <div>{children}</div>;
}
