import Link from "next/link";
import { APPS } from "@/lib/apps";

export default function Launcher() {
  
  return (
    <div className="grid place-items-center overflow-hidden p-6">
      <div className="grid w-full max-w-5xl grid-cols-2 md:grid-cols-4 gap-6 place-items-center">
        {APPS.map(({ href, label, Icon, colorClass }) => (
          <Link
            key={href}
            href={href}
            className="flex h-40 w-40 flex-col items-center justify-center rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
          >
            <Icon className={`h-16 w-16 mb-4 ${colorClass}`} />
            <span className="text-lg font-semibold text-gray-800">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
