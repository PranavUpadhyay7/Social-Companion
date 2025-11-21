"use client";
import React, { useState } from "react";
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import Link from "next/link";

function FirstDiv() {
  const [modalVisibility, setModalVisibility] = useState(false);

  function divShow() {
    setModalVisibility(true);
  }

  function divHide() {
    setModalVisibility(false);
  }

  return (
    <div>
      {/* ✅ Modal only shows when visible */}
      {modalVisibility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex items-center justify-center h-screen w-screen bg-black/50">
            <div className="relative flex flex-col rounded-lg items-center justify-center h-[70vh] w-[35vw] bg-zinc-900">
              <XMarkIcon
                className="h-6 w-6 text-white absolute top-4 right-4 cursor-pointer"
                onClick={divHide}
              />

              <div className="text-white font-bold text-center mb-4">
                Profile Picture
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col gap-2 w-[30vw] mx-auto p-6 rounded-lg"
              >
                <h1 className="text-white font-semibold text-base">Bio</h1>
                <input
                  type="text"
                  name="bio"
                  placeholder=""
                  onChange={null}
                  className="border bg-zinc-900 text-white text-sm hover:bg-zinc-800 border-gray-500  p-3 mb-6 rounded-lg 
               focus:outline-none focus:ring-[1px] focus:ring-[#7F00FF] 
               focus:border-[#7F00FF] transition-all duration-200"
                />

                <h1 className="text-white font-semibold">Gender</h1>
                <input
                  type="text"
                  name="gender"
                  placeholder=""
                  onChange={null}
                  className="border bg-zinc-900 text-white hover:bg-zinc-800 p-3 mb-6 border-gray-500 rounded-lg 
               focus:outline-none focus:ring-[1px] focus:ring-[#7F00FF] 
               focus:border-[#7F00FF] transition-all duration-200"
                />

                <button
                  type="submit"
                  className="text-white bg-[#7F00FF] px-3 py-4 rounded-lg"
                >
                  Update Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Sidebar */}
      <div className="fixed z-40 flex flex-col gap-10 mx-auto text-center border-r-[1px] border-stone-800 h-[100vh]">
        <div className="pt-16 pb-20 px-6 xl:block md:text-[1vw] xl:text-[2vw] italic font-black text-white">
          <Link href="/">
            <h1 className="">SceneMates</h1>
          </Link>
        </div>

        {/* Home */}
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/">
            <div className="flex justify-center xl:justify-start items-center gap-0 xl:gap-3">
              <HomeIcon className="h-6 w-6 text-white" />
              <h1 className="hidden xl:block xl:text-white xl:font-extrabold xl:text-md">
                Home
              </h1>
            </div>
          </Link>
        </button>

        {/* Conversation */}
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/">
            <div className="flex justify-center xl:justify-start items-center gap-0 xl:gap-3">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-white" />
              <h1 className="hidden xl:block xl:text-white xl:font-extrabold xl:text-md">
                Conversation
              </h1>
            </div>
          </Link>
        </button>

        {/* Groups */}
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/">
            <div className="flex justify-center xl:justify-start items-center gap-0 xl:gap-3">
              <UserGroupIcon className="h-6 w-6 text-white" />
              <h1 className="hidden xl:block xl:text-white xl:font-extrabold xl:text-md">
                Groups
              </h1>
            </div>
          </Link>
        </button>

        {/* Settings */}
        <button
          className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md"
          onClick={divShow}
        >
          <div className="flex justify-center xl:justify-start items-center gap-0 xl:gap-3">
            <Cog6ToothIcon className="h-6 w-6 text-white cursor-pointer" />
            <h1 className="hidden xl:block xl:text-white xl:font-extrabold xl:text-md">
              Settings
            </h1>
          </div>
        </button>
      </div>
    </div>
  );
}

export default FirstDiv;
