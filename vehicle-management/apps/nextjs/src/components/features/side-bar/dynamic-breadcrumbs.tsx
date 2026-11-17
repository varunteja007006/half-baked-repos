import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@fleetio/ui/breadcrumb";

export const DynamicBreadCrumbs = ({
  breadCrumbList,
}: {
  breadCrumbList: {
    href: string;
    label: string;
    isPage: boolean;
  }[];
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadCrumbList.map((item) => {
          if (item.isPage) {
            return (
              <BreadcrumbItem key={item.label + item.href}>
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }
          return (
            <Fragment key={item.label + item.href}>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
