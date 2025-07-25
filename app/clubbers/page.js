"use client";
import React from "react";

import FirstDiv from "./ClubberComponents/FirstDiv";
import FeedMap from "./ClubberComponents/FeedMap";

function page() {
  return (
    <div className="flex flex-row w-[100vw] justify-between">
      <div className=" w-1/3">
        <FirstDiv />
      </div>
      <div className="pt-20 w-2/3  h-[100vh">
        <FeedMap />
      </div>
      <div className="pt-20 w-1/3">
        <img src="null" alt="Profile Picture"></img>
      </div>
    </div>
  );
}
export default page;
