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
      {/* ===================== MODAL ===================== */}
      {modalVisibility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="flex items-center justify-center h-screen w-screen bg-black/50">
            <div className="relative flex flex-col rounded-lg items-center justify-center h-[70vh] w-[90vw] md:w-[35vw] bg-zinc-900">
              <XMarkIcon
                className="h-6 w-6 text-white absolute top-4 right-4 cursor-pointer"
                onClick={divHide}
              />
              <div>
                <img
                  src="/images/5.jpeg"
                  className="h-20 w-20 mb-4 rounded-full border-1 border-gray-500"
                />
              </div>

              <div className="text-white font-bold text-center mb-4">
                Profile Picture
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col gap-2 w-[80vw] md:w-[30vw] mx-auto p-6 rounded-lg"
              >
                <h1 className="text-white font-semibold text-base">Bio</h1>
                <input
                  type="text"
                  name="bio"
                  className="border bg-zinc-900 text-white text-sm hover:bg-zinc-800 border-gray-500 p-3 mb-6 rounded-lg 
                  focus:outline-none focus:ring-[1px] focus:ring-[#7F00FF] 
                  focus:border-[#7F00FF] transition-all duration-200"
                />

                <h1 className="text-white font-semibold">Gender</h1>
                <input
                  type="text"
                  name="gender"
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

      {/* ===================== SIDEBAR (Desktop / md+) ===================== */}
      <div className="hidden md:flex fixed z-40 flex-col gap-10 mx-auto text-center border-r-[1px] border-stone-800 h-[100vh] w-[15vw]">
        <div className="pt-16 pb-20 px-6 italic font-black text-white text-[2vw]">
          <Link href="/">
            <h1>SceneMates</h1>
          </Link>
        </div>

        {/* Home */}
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-6 w-6 text-white" />
              <h1 className="text-white font-extrabold">Home</h1>
            </div>
          </Link>
        </button>

        {/* Conversation */}
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/">
            <div className="flex items-center gap-3">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-white" />
              <h1 className="text-white font-extrabold">Conversation</h1>
            </div>
          </Link>
        </button>

        {/* Groups */}
        <button className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md">
          <Link href="/">
            <div className="flex items-center gap-3">
              <UserGroupIcon className="h-6 w-6 text-white" />
              <h1 className="text-white font-extrabold">Groups</h1>
            </div>
          </Link>
        </button>

        {/* Settings */}
        <button
          className="hover:bg-zinc-800 mx-4 px-2 py-2 rounded-md"
          onClick={divShow}
        >
          <div className="flex items-center gap-3">
            <Cog6ToothIcon className="h-6 w-6 text-white" />
            <h1 className="text-white font-extrabold">Settings</h1>
          </div>
        </button>
      </div>

      {/* ===================== FOOTER (Mobile Only) ===================== */}
      <FooterDiv openModal={divShow} />
    </div>
  );
}

export default FirstDiv;

/* =====================================================
   FOOTER COMPONENT
===================================================== */
const FooterDiv = ({ openModal }) => {
  return (
    <div className="md:hidden">
      <div className="fixed bottom-0 left-0 w-full z-50 bg-black text-white flex justify-around items-center p-4 border-t border-zinc-700">
        <Link href="/">
          <HomeIcon className="h-6 w-6 text-white" />
        </Link>

        <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-white" />

        <UserGroupIcon className="h-6 w-6 text-white" />

        {/* Settings opens modal */}
        <button onClick={openModal}>
          <Cog6ToothIcon className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
};
