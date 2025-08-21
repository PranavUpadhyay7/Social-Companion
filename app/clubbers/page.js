"use client";
import React from "react";
import FooterDiv from "./ClubberComponents/FooterDiv";
import FirstDiv from "./ClubberComponents/FirstDiv";
import FeedMap from "./ClubberComponents/FeedMap";
import ThirdDiv from "./ClubberComponents/ThirdDiv";

function page() {
  return (
    <>
      <div className="bg-black">
        <div className="flex flex-col md:flex-row w-[100vw] justify-between">
          <div className="hidden  md:block md:w-1/3">
            <FirstDiv />
          </div>
          <div className="pt-20 md:w-2/3 text-center mx-auto h-[100vh]">
            <FeedMap />
          </div>
          <div className="hidden md:block md:pt-20 md:w-1/3">
            <ThirdDiv />
          </div>
        </div>

        {/* Mobile footer - fixed */}
        <div className="md:hidden">
          <FooterDiv />
        </div>
      </div>
    </>
  );
}
export default page;
