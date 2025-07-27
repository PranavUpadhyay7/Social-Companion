"use client";
import React from "react";
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

function FirstDiv() {
  return (
    <div>
      <div className="fixed flex flex-col gap-16 md:px-6 xl:px-20 border-r-[1px] border-stone-800 h-[100vh] ">
        <div className="pt-16 pb-20 xl:block md:text-[1vw] xl:text-[2vw] italic font-black text-[#39ff14]">
          <h1 className="">SceneMates</h1>
        </div>
        <div className="flex flex-row gap-3 ">
          <HomeIcon className="h-6 w-6 text-[#39ff14] " />
          <h1 className="hidden xl:block xl:text-white  xl:font-extrabold xl:text-md">
            Home
          </h1>
        </div>
        <div className="flex flex-row gap-3 ">
          <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-[#39ff14]" />
          <h1 className="hidden xl:block xl:text-white  xl:font-extrabold xl:text-md">
            Conversation
          </h1>
        </div>
        <div className="flex flex-row gap-3 ">
          <UserGroupIcon className="h-6 w-6 text-[#39ff14]" />
          <h1 className="hidden xl:block xl:text-white  xl:font-extrabold xl:text-md">
            Groups
          </h1>
        </div>
      </div>
    </div>
  );
}

export default FirstDiv;
