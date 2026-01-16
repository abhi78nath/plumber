"use client";

import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "./ui/breadcrumb";

function BreadCrumberHeader() {
  const pathName = usePathname();
  const paths = pathName === "/" ? [""] : pathName?.split("/");
  return (
    <div className="flex items-center flex-start">
      <Breadcrumb>
        <BreadcrumbList>
          {paths.map((path, index) => {
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  <BreadcrumbLink className="capitalize" href={`/${path}`}>
                    {path === "" ? "home" : path}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export default BreadCrumberHeader;
