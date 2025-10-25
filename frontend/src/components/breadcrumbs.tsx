import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { uppercaseFirstLetter } from "@/utils/utils";
import React, { useMemo } from "react";
import { useLocation } from "react-router";

export default function Breadcrumbs() {
    const location = useLocation();
    const urlSegments = useMemo(() => location.pathname.split('/').filter(segment => segment), [location.pathname]);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {urlSegments.length > 1 && urlSegments.map((segment, index) => {
                    const path = `/${urlSegments.slice(0, index + 1).join('/')}`;
                    return (
                        <React.Fragment key={path}>
                            {index !== 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem>
                                {index === urlSegments.length - 1 ? (
                                    <BreadcrumbPage>
                                        {uppercaseFirstLetter(segment)}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={path}>{uppercaseFirstLetter(segment)}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}