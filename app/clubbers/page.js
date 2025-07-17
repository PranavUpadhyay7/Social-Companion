"use client";
import React from "react";
import Feed from "./ClubberComponents/Feed";

function page() {
  return (
    <div className="flex flex-row w-[100vw] justify-between">
      <div className="flex flex-col gap-10 pl-8 pr-24 border-r-[1px] border-stone-800 h-[100vh]">
        <div className="pt-20">
          <img src="null" alt="Profile Picture"></img>
        </div>
        <div>
          <h1 className="text-white">app name</h1>
        </div>
        <div>
          <h1 className="text-white">Conversation</h1>
        </div>
        <div>
          <h1 className="text-white">Groups</h1>
        </div>
      </div>
      <div className="pt-20">
        <Feed />
      </div>
      <div className="pt-20">
        <img src="null" alt="Profile Picture"></img>
      </div>
    </div>
  );
}
export default page;
