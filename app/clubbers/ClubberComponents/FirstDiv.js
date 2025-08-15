"use client";
import React from "react";
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

function FirstDiv() {
  return (
    <div>
      <div className="fixed flex flex-col gap-16 mx-auto text-center border-r-[1px] border-stone-800 h-[100vh] ">
        <div className="pt-16 pb-20 px-6 xl:block md:text-[1vw] xl:text-[2vw] italic font-black text-white">
          <Link href="/">
            <h1 className="">SceneMates</h1>
          </Link>
        </div>
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/">
            <div className="flex justify-center xl:justify-start items-center gap-0 xl:gap-3">
              <HomeIcon className="h-6 w-6 text-white" />
              <h1 className="hidden xl:block xl:text-white xl:font-extrabold xl:text-md">
                Home
              </h1>
            </div>
          </Link>
        </button>{" "}
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/">
            <div className="flex justify-center xl:justify-start items-center gap-0 xl:gap-3">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-white" />
              <h1 className="hidden xl:block xl:text-white xl:font-extrabold xl:text-md">
                Conversation
              </h1>
            </div>
          </Link>
        </button>{" "}
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/">
            <div className="flex justify-center xl:justify-start items-center gap-0 xl:gap-3">
              <UserGroupIcon className="h-6 w-6 text-white" />
              <h1 className="hidden xl:block xl:text-white xl:font-extrabold xl:text-md">
                Groups
              </h1>
            </div>
          </Link>
        </button>{" "}
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/settingsu">
            {" "}
            <div className="flex justify-center xl:justify-start items-center gap-0 xl:gap-3">
              <Cog6ToothIcon className="h-6 w-6 text-white" />
              <h1 className="hidden xl:block xl:text-white xl:font-extrabold xl:text-md">
                Settings
              </h1>
            </div>
          </Link>
        </button>
      </div>
    </div>
  );
}

export default FirstDiv;
