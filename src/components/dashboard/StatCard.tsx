'use client';

import { useRouter } from 'next/navigation';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'red' | 'green' | 'blue' | 'yellow';
  href?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  color,
  href,
}: StatCardProps) {
  const router = useRouter();

  const colors = {
    red: 'bg-teal-100 text-teal-700 group-hover:bg-teal-700 group-hover:text-white',
    green: 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white',
    blue: 'bg-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white',
    yellow: 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white',
  };

  const border = {
    red: 'border-teal-200',
    blue: 'border-sky-200',
    green: 'border-green-200',
    yellow: 'border-yellow-200',
  };

  return (
    <div
      onClick={() => href && router.push(href)}
      className={`group bg-white p-6 rounded-2xl shadow-md border ${border[color]}
                  hover:shadow-xl transition-all cursor-pointer active:scale-95`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-[#0f766e]">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
