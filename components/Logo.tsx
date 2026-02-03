import { cn } from "@/lib/utils";
import { WorkflowIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

function Logo({
  fontSize = "text-2xl",
  iconSize = 20,
}: {
  fontSize?: string;
  iconSize?: number;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "text-2xl font-extrabold flex items-center gap-2",
        fontSize
      )}
    >
      <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 p-2">
        <WorkflowIcon size={iconSize} className="stroke-black" />
      </div>
      <div>
        <span className="text-stone-700 dark:text-stone-300 dark:text-[#9FB7C6] text-[1.4rem] font-semibold">Plumber</span>
      </div>
    </Link>
  );
}
export default Logo;
