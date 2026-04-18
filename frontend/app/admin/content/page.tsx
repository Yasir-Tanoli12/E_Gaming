"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminContentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/contacts");
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#EDC537] border-t-transparent" />
    </div>
  );
}
