"use client";
import React from "react";
import EventProps from "./EventProps";
import eventcard from "@/public/eventcard";

function cardmap(cardobject) {
  return (
    <EventProps
      key={cardobject.id}
      image={cardobject.image}
      title={cardobject.heading}
      venue={cardobject.text}
      buttontext={cardobject.btn}
    />
  );
}

function crazyEvents() {
  return (
    <div className=" pt-[20px] md:pt-[60px]">
      <section className="bg-black text-white py-0 md:py-4 px-6">
        <h2 className="text-5xl font-medium text-center md:text-left mx-auto md:mx-0 md:ml-0 md:pl-10 pb-10 md:pb-20 tracking-widest mb-4">
          LINEUP
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:grid-cols-4 xl:gap-12 mx-auto md:px-6 lg:px-10">
          {eventcard.map(cardmap)}
        </div>
      </section>
    </div>
  );
}

export default crazyEvents;
