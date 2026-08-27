"use client";
import Image from "next/image";
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

  return (
    <>
      {/* ===================== MODAL ===================== */}
      {modalVisibility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative flex flex-col items-center rounded-xl w-[90%] md:w-[400px] bg-zinc-900 p-6">
            <XMarkIcon
              className="h-6 w-6 text-white absolute top-4 right-4 cursor-pointer"
              onClick={() => setModalVisibility(false)}
            />

            <Image
              src="/images/1.jpeg"
              alt="Profile preview"
              width={80}
              height={80}
              className="h-20 w-20 mb-4 rounded-full border border-gray-600"
            />

            <h2 className="text-white font-bold mb-4">Profile Settings</h2>

            <form className="flex flex-col gap-4 w-full">
              <input
                placeholder="Bio"
                className="bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700"
              />

              <input
                placeholder="Gender"
                className="bg-zinc-800 text-white p-3 rounded-lg border border-zinc-700"
              />

              <button className="bg-white text-black py-3 rounded-lg font-semibold">
                Update
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== SIDEBAR ===================== */}
      <div className="hidden md:flex fixed top-0 left-0 z-40 flex-col justify-between h-screen w-60 border-r border-zinc-800 bg-black px-6">
        {/* TOP */}
        <div>
          <div className="py-10 text-center">
            <Link href="/">
              <h1 className="text-white italic font-black text-2xl">
                SceneMates
              </h1>
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <SidebarItem icon={<HomeIcon />} text="Home" />
            <SidebarItem
              icon={<ChatBubbleBottomCenterTextIcon />}
              text="Conversation"
            />
            <SidebarItem icon={<UserGroupIcon />} text="Groups" />

            <button onClick={() => setModalVisibility(true)}>
              <SidebarItem icon={<Cog6ToothIcon />} text="Settings" />
            </button>
          </div>
        </div>

        {/* PROFILE */}
        <div className="mb-6 flex justify-center">
          <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
            P
          </div>
        </div>
      </div>

      {/* ===================== MOBILE FOOTER ===================== */}
      <FooterDiv openModal={() => setModalVisibility(true)} />
    </>
  );
}

export default FirstDiv;

const SidebarItem = ({ icon, text }) => (
  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800 transition cursor-pointer">
    <div className="h-7 w-7 text-white">{icon}</div>
    <span className="text-white text-lg font-semibold">{text}</span>
  </div>
);

const FooterDiv = ({ openModal }) => (
  <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-black border-t border-zinc-700">
    <div className="flex justify-around items-center p-4">
      <HomeIcon className="h-6 w-6 text-white" />
      <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-white" />
      <UserGroupIcon className="h-6 w-6 text-white" />
      <button onClick={openModal}>
        <Cog6ToothIcon className="h-6 w-6 text-white" />
      </button>
    </div>
  </div>
);
