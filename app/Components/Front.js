"use client";

import React from "react";
import Link from "next/link";

const front = () => {
  return (
    <div className=" bg-black ">
      <div className="w-full flex justify-center px-4 pt-20 lg:pt-[200px] md:pt-[120px] pb-8 md:pb-16 lg:pb-20 ">
        <h1 className="text-white scale-y-[1.2] text-[7vw] leading-[0.8]  font-bold text-center font-stretch-expanded ">
          DISCOVER YOUR
          <br />
          NIGHTLIFE CREW
        </h1>
      </div>
      <div className="text-[1.5vw]">
        <h2 className="text-gray-400 text-center text-wrap">
          Join epic parties, connect with clubbers, and match with groups around
          you.
        </h2>
      </div>
      <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row justify-between gap-10 md:gap-0 w-[50vw] md:w-[80vw] py-20 mx-auto text-center">
        <Link href="/events">
          <button className="text-[#2e2e2e] font-black text-sm sm:text-sm lg:text-sm py-4 px-14 lg:px-20 tracking-widest rounded-2xl bg-[#39ff14] shadow-[0_0_8px_#39ff14,0_0_12px_#39ff14] hover:bg-[#66ff66] hover:shadow-[0_0_6px_#66ff66,0_0_10px_#66ff66] transition-shadow duration-200">
            Events
          </button>
        </Link>
        <Link href="/clubbers">
          <button className="text-[#2e2e2e] font-black text-sm sm:text-sm lg:text-sm py-4 px-14 lg:px-20 tracking-widest rounded-2xl bg-[#39ff14] shadow-[0_0_8px_#39ff14,0_0_12px_#39ff14] hover:bg-[#66ff66] hover:shadow-[0_0_6px_#66ff66,0_0_10px_#66ff66] transition-shadow duration-200">
            Clubbers
          </button>
        </Link>
        <Link href="/groups">
          <button className="text-[#2e2e2e] font-black text-sm sm:text-sm lg:text-sm py-4 px-14 lg:px-20 tracking-widest rounded-2xl bg-[#39ff14] shadow-[0_0_8px_#39ff14,0_0_12px_#39ff14] hover:bg-[#66ff66] hover:shadow-[0_0_6px_#66ff66,0_0_10px_#66ff66] transition-shadow duration-200">
            Groups
          </button>
        </Link>
      </div>
    </div>
  );
};

export default front;
