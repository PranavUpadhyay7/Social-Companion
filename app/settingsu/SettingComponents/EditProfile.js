"use client";
import React from "react";
import { useState } from "react";
const EditProfile = () => {
  return (
    <div className="flex items-center  flex-col justify-center h-screen ">
      <div className="text-white text-center ">Profile Picture</div>{" "}
      <form
        onSubmit={null}
        className="flex flex-col gap-2 w-[30vw] mx-auto p-6 border rounded-lg"
      >
        <h1 className="text-white text-base">Bio</h1>
        <input
          type="text"
          name="name"
          placeholder=""
          onChange={null}
          className="border bg-zinc-900 hover:bg-zinc-800 p-3 mb-6 rounded-lg 
             focus:outline-none focus:ring-[1px] focus:ring-[#66ff66] 
             focus:border-[#66ff66] transition-all duration-200  "
        />
        <h1 className="text-white">Gender</h1>
        <input
          type="email"
          name="email"
          placeholder=""
          onChange={null}
          className="border bg-zinc-900 hover:bg-zinc-800 p-3 mb-6 rounded-lg 
             focus:outline-none focus:ring-[1px] focus:ring-[#66ff66] 
             focus:border-[#66ff66] transition-all duration-200"
        />
        <button
          type="submit"
          className="w-full flex items-center justify-center font-primary font-medium transition duration-300 text-[14px] cursor-pointer px-6 py-2 group relative inline-block overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 hover:from-primary-600 hover:via-primary-700 hover:to-primary-600 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-0.5 border border-primary-400/20 hover:border-primary-300/40 cursor-pointerrounded-lg w-full"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
