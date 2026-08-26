"use client";
import React from "react";
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

const FooterDiv = () => {
  return (
    <div>
      <div className="fixed bottom-0 left-0 w-full z-50 bg-black text-white flex justify-around items-center p-4 ">
        <div>
          <Link href="/">
            <HomeIcon className="h-6 w-6 text-white" />
          </Link>
        </div>
        <div>
          <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <UserGroupIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <Cog6ToothIcon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default FooterDiv;
